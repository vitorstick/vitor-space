/// <reference types="dom-chromium-ai" />

export type LocalSummarizerType = 'key-points' | 'tl;dr' | 'tldr' | 'teaser' | 'headline';
export type SummarizerStyleType = LocalSummarizerType;
export type SummarizerFormatType = 'markdown' | 'plain-text';
export type SummarizerLengthType = 'short' | 'medium' | 'long';

export type SummarizerAvailabilityStatus =
  | 'readily'
  | 'after-download'
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable'
  | 'no'
  | 'unsupported';

export type SummarizerAvailability = SummarizerAvailabilityStatus;

export interface SummarizerProgressEvent {
  loaded: number;
  total?: number;
}

export interface SummarizerClientSession {
  summarize(text: string, options?: { context?: string; signal?: AbortSignal }): Promise<string>;
  summarizeStreaming(
    text: string,
    options?: { context?: string; signal?: AbortSignal }
  ): AsyncIterable<string> | ReadableStream<string>;
  destroy(): void;
}

export interface SummarizerClientFactory {
  availability(options?: SummarizerCreateOptions): Promise<string>;
  capabilities?(): Promise<{ available: 'readily' | 'after-download' | 'no' }>;
  create(options?: SummarizerCreateOptions): Promise<SummarizerClientSession>;
}

// Augment Window and WorkerGlobalScope with `ai` namespace and `Summarizer`
declare global {
  interface Window {
    ai?: {
      summarizer?: SummarizerClientFactory;
    };
  }
}

/**
 * Accesses the Chrome Built-in AI Summarizer factory if available
 */
export function getSummarizerAPI(): SummarizerClientFactory | null {
  if (typeof window === 'undefined') return null;

  const anyWin = window as unknown as {
    ai?: { summarizer?: SummarizerClientFactory };
    Summarizer?: SummarizerClientFactory;
  };

  const anySelf = typeof self !== 'undefined' ? (self as unknown as {
    ai?: { summarizer?: SummarizerClientFactory };
    Summarizer?: SummarizerClientFactory;
  }) : null;

  return (
    anyWin.ai?.summarizer ||
    anySelf?.ai?.summarizer ||
    anyWin.Summarizer ||
    anySelf?.Summarizer ||
    null
  );
}

/**
 * Probes the browser for Summarizer API support & readiness
 */
export async function checkSummarizerAvailability(
  options?: SummarizerCreateOptions
): Promise<SummarizerAvailabilityStatus> {
  try {
    const api = getSummarizerAPI();
    if (!api) {
      return 'unsupported';
    }

    if (typeof api.availability === 'function') {
      const status = (await api.availability(options)) as SummarizerAvailabilityStatus;
      return status || 'unsupported';
    }

    if (typeof api.capabilities === 'function') {
      const caps = await api.capabilities();
      if (caps?.available) {
        return caps.available;
      }
    }

    return 'unsupported';
  } catch (err) {
    console.debug('Summarizer API availability check failed:', err);
    return 'unsupported';
  }
}

/**
 * Checks if the availability status means the API is usable or downloadable
 */
export function isSummarizerUsable(status: SummarizerAvailabilityStatus): boolean {
  return (
    status === 'readily' ||
    status === 'available' ||
    status === 'after-download' ||
    status === 'downloadable' ||
    status === 'downloading'
  );
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
      // Remove scripts, styles, images
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
  const api = getSummarizerAPI();
  if (!api) {
    throw new Error('Summarizer API is not available on this browser.');
  }

  // Normalize 'tl;dr' to 'tldr' based on standard W3C / Chromium WebIDL definitions
  const normalizedType: SummarizerType = type === 'tl;dr' ? 'tldr' : type;

  const createOptions: SummarizerCreateOptions = {
    type: normalizedType,
    format,
    length,
    outputLanguage: 'en',
    sharedContext: sharedContext || 'Technical software engineering article',
    signal,
    monitor: (monitor: CreateMonitor) => {
      monitor.addEventListener('downloadprogress', (e: ProgressEvent) => {
        if (e.total && e.total > 0) {
          const pct = Math.min(100, Math.round((e.loaded / e.total) * 100));
          onDownloadProgress?.(pct);
        } else if (e.loaded > 0) {
          onDownloadProgress?.(Math.min(99, Math.round(e.loaded * 100)));
        }
      });
    },
  };

  const summarizer = await api.create(createOptions);

  try {
    if (signal?.aborted) {
      throw new Error('Summarization aborted.');
    }

    // Try streaming first
    if (typeof summarizer.summarizeStreaming === 'function') {
      try {
        const streamResult = summarizer.summarizeStreaming(content, { signal });
        let accumulated = '';

        // Check if streamResult is an AsyncIterable
        if (
          streamResult &&
          typeof (streamResult as AsyncIterable<string>)[Symbol.asyncIterator] === 'function'
        ) {
          for await (const chunk of streamResult as AsyncIterable<string>) {
            if (signal?.aborted) break;
            accumulated += chunk;
            onChunk?.(accumulated, chunk);
          }
          return accumulated;
        }

        // Check if streamResult is a ReadableStream
        if (streamResult && typeof (streamResult as ReadableStream<string>).getReader === 'function') {
          const reader = (streamResult as ReadableStream<string>).getReader();
          try {
            while (true) {
              if (signal?.aborted) break;
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                accumulated += value;
                onChunk?.(accumulated, value);
              }
            }
          } finally {
            reader.releaseLock();
          }
          return accumulated;
        }
      } catch (streamErr) {
        console.warn('Streaming failed, falling back to direct summarize():', streamErr);
      }
    }

    // Fallback to non-streaming summarize()
    const summary = await summarizer.summarize(content, { signal });
    onChunk?.(summary, summary);
    return summary;
  } finally {
    try {
      summarizer.destroy();
    } catch {
      // Ignore destroy error
    }
  }
}
