/// <reference types="dom-chromium-ai" />

export type LocalSummarizerType = SummarizerType | 'tl;dr';
export type SummarizerStyleType = LocalSummarizerType;
export type SummarizerFormatType = SummarizerFormat;
export type SummarizerLengthType = SummarizerLength;
export type SummarizerAvailabilityStatus = Availability;
export type SummarizerAvailability = SummarizerAvailabilityStatus;

export const DEFAULT_SUMMARIZER_OPTIONS: SummarizerCreateCoreOptions = {
  type: 'key-points',
  format: 'markdown',
  length: 'medium',
  outputLanguage: 'en',
  expectedInputLanguages: ['en'],
};

/**
 * Accesses the Chrome Built-in AI Summarizer factory if available
 */
export function getSummarizerAPI(): typeof Summarizer | null {
  if (typeof Summarizer !== 'undefined') {
    return Summarizer;
  }
  const anyGlobal =
    typeof window !== 'undefined'
      ? (window as unknown as { Summarizer?: typeof Summarizer })
      : typeof self !== 'undefined'
      ? (self as unknown as { Summarizer?: typeof Summarizer })
      : null;

  return anyGlobal?.Summarizer || null;
}

/**
 * Probes the browser for Summarizer API support & readiness
 */
export async function checkSummarizerAvailability(
  options?: SummarizerCreateCoreOptions
): Promise<SummarizerAvailabilityStatus> {
  try {
    const api = getSummarizerAPI();
    if (!api) {
      return 'unavailable';
    }

    const resolvedOptions: SummarizerCreateCoreOptions = {
      ...DEFAULT_SUMMARIZER_OPTIONS,
      ...options,
    };

    if (typeof api.availability === 'function') {
      const status = await api.availability(resolvedOptions);
      return status || 'unavailable';
    }

    return 'unavailable';
  } catch (err) {
    console.debug('Summarizer API availability check failed:', err);
    return 'unavailable';
  }
}

/**
 * Checks if the availability status means the API is usable or downloadable
 */
export function isSummarizerUsable(status: SummarizerAvailabilityStatus): boolean {
  return status === 'available' || status === 'downloadable' || status === 'downloading';
}

/**
 * Sanitizes markdown or html content to prepare a clean text payload for summarization
 */
export function prepareTextForSummarization(rawMarkdown?: string, rawHtml?: string): string {
  if (rawMarkdown && rawMarkdown.trim().length > 0) {
    // Remove frontmatter if present
    let text = rawMarkdown.replace(/^---[\s\S]*?---\n*/, '');
    // Remove markdown images ![alt](url)
    text = text.replace(/!\[.*?\]\(.*?\)/g, '');
    // Clean markdown links to keep just link text [text](url) -> text
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Remove excess whitespace
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    if (text.length > 50) return text;
  }

  if (rawHtml && rawHtml.trim().length > 0) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');
      // Remove scripts, styles, images, and non-content elements
      doc.querySelectorAll('script, style, img, svg, noscript').forEach((el) => el.remove());
      const text = doc.body.textContent || '';
      return text.replace(/\s+/g, ' ').trim();
    } catch {
      // Fallback regex strip
      return rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
  }

  return '';
}

export interface SummarizeExecutionOptions {
  content: string;
  type: SummarizerStyleType;
  format: SummarizerFormatType;
  length: SummarizerLengthType;
  sharedContext?: string;
  onChunk?: (fullAccumulatedText: string, latestDelta: string) => void;
  onDownloadProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

// In-memory cache for Summarizer instances to avoid re-instantiation overhead
const summarizerCache = new Map<string, Promise<Summarizer>>();

function getCacheKey(type: SummarizerType, format: SummarizerFormat, length: SummarizerLength): string {
  return `${type}|${format}|${length}`;
}

export async function getOrCreateSummarizer(
  options: SummarizerCreateOptions
): Promise<Summarizer> {
  const rawType = options.type as string | undefined;
  const normType: SummarizerType = rawType === 'tl;dr' ? 'tldr' : (options.type || 'key-points');
  const format: SummarizerFormat = options.format || 'markdown';
  const length: SummarizerLength = options.length || 'medium';
  const key = getCacheKey(normType, format, length);

  let existing = summarizerCache.get(key);
  if (!existing) {
    const api = getSummarizerAPI();
    if (!api) {
      throw new Error('Summarizer API is not available on this browser.');
    }

    existing = api.create({
      ...options,
      type: normType,
      format,
      length,
    });
    summarizerCache.set(key, existing);

    existing.catch(() => {
      summarizerCache.delete(key);
    });
  }

  return existing;
}

export async function clearSummarizerCache(): Promise<void> {
  const promises = Array.from(summarizerCache.values());
  summarizerCache.clear();
  for (const p of promises) {
    try {
      const instance = await p;
      instance.destroy();
    } catch {
      // Ignore destruction error
    }
  }
}

async function consumeStream(
  stream: ReadableStream<string>,
  onChunk?: (fullAccumulatedText: string, latestDelta: string) => void,
  signal?: AbortSignal
): Promise<string> {
  let accumulated = '';
  for await (const chunk of stream) {
    if (signal?.aborted) {
      throw signal.reason || new DOMException('Summarization aborted.', 'AbortError');
    }
    accumulated += chunk;
    onChunk?.(accumulated, chunk);
  }
  return accumulated;
}

/**
 * Splits text into logical chunks that fit within the model quota
 */
function chunkText(text: string, maxChunkLength: number): string[] {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxChunkLength && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }
  return chunks.length > 0 ? chunks : [text];
}

/**
 * Executes a summarization session with streaming support and download tracking
 */
export async function generateArticleSummary({
  content,
  type,
  format,
  length,
  sharedContext,
  onChunk,
  onDownloadProgress,
  signal,
}: SummarizeExecutionOptions): Promise<string> {
  // Normalize 'tl;dr' to standard W3C 'tldr'
  const normalizedType: SummarizerType = type === 'tl;dr' ? 'tldr' : type;

  const createOptions: SummarizerCreateOptions = {
    type: normalizedType,
    format,
    length,
    outputLanguage: 'en',
    expectedInputLanguages: ['en'],
    sharedContext: sharedContext || 'Technical software engineering article',
    signal,
    monitor: (monitor: CreateMonitor) => {
      monitor.addEventListener('downloadprogress', (e: ProgressEvent) => {
        // e.loaded is normalized 0 -> 1 in current Chrome spec
        const pct =
          e.loaded <= 1
            ? Math.round(e.loaded * 100)
            : e.total && e.total > 0
            ? Math.min(100, Math.round((e.loaded / e.total) * 100))
            : Math.round(e.loaded);
        onDownloadProgress?.(Math.min(100, Math.max(1, pct)));
      });
    },
  };

  const summarizer = await getOrCreateSummarizer(createOptions);

  if (signal?.aborted) {
    throw signal.reason || new DOMException('Summarization aborted.', 'AbortError');
  }

  // Quota check: if inputQuota exists, ensure input does not exceed quota
  let textToSummarize = content;
  if (typeof summarizer.measureInputUsage === 'function' && summarizer.inputQuota > 0) {
    try {
      const usage = await summarizer.measureInputUsage(content, { signal });
      if (usage > summarizer.inputQuota) {
        // Content exceeds inputQuota; divide into section chunks and synthesize
        const maxChunkChars = Math.floor(content.length * (summarizer.inputQuota / usage) * 0.85);
        const chunks = chunkText(content, maxChunkChars);
        const intermediateSummaries: string[] = [];

        for (const chunk of chunks) {
          if (signal?.aborted) break;
          const chunkSummary = await summarizer.summarize(chunk, { signal });
          intermediateSummaries.push(chunkSummary);
        }

        textToSummarize = intermediateSummaries.join('\n\n');
      }
    } catch (quotaErr) {
      console.warn('Quota check failed, proceeding with original text:', quotaErr);
    }
  }

  // Attempt streaming execution
  let streamResult: ReadableStream<string>;
  try {
    streamResult = summarizer.summarizeStreaming(textToSummarize, { signal });
  } catch (err) {
    // If summarizeStreaming threw before returning a stream, fall back to non-streaming summarize
    if (signal?.aborted) {
      throw signal.reason || new DOMException('Summarization aborted.', 'AbortError');
    }
    console.warn('summarizeStreaming threw error, falling back to summarize():', err);
    const summary = await summarizer.summarize(textToSummarize, { signal });
    onChunk?.(summary, summary);
    return summary;
  }

  try {
    return await consumeStream(streamResult, onChunk, signal);
  } catch (streamErr) {
    // If stream aborted, rethrow directly
    if (signal?.aborted || (streamErr instanceof DOMException && streamErr.name === 'AbortError')) {
      throw streamErr;
    }
    console.warn('Summarizer stream error, attempting non-streaming summarize():', streamErr);
    const summary = await summarizer.summarize(textToSummarize, { signal });
    onChunk?.(summary, summary);
    return summary;
  }
}
