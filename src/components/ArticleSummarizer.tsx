import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Check,
  Copy,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Square,
  Cpu,
  DownloadCloud,
  FileText,
} from 'lucide-react';
import {
  checkSummarizerAvailability,
  isSummarizerUsable,
  generateArticleSummary,
  prepareTextForSummarization,
  type SummarizerStyleType,
  type SummarizerLengthType,
  type SummarizerAvailability,
} from '../lib/summarizer';

interface ArticleSummarizerProps {
  rawMarkdown?: string;
  rawHtml?: string;
  articleTitle?: string;
  className?: string;
  autoExpand?: boolean;
}

const TYPE_OPTIONS: { id: SummarizerStyleType; label: string; description: string }[] = [
  { id: 'key-points', label: 'KEY POINTS', description: 'Bullet list of core insights' },
  { id: 'tl;dr', label: 'TL;DR', description: 'Concise executive overview' },
  { id: 'teaser', label: 'TEASER', description: 'Intriguing preview snippet' },
  { id: 'headline', label: 'HEADLINE', description: 'Punchy single-line synopsis' },
];

const LENGTH_OPTIONS: { id: SummarizerLengthType; label: string }[] = [
  { id: 'short', label: 'SHORT' },
  { id: 'medium', label: 'MEDIUM' },
  { id: 'long', label: 'LONG' },
];

export const ArticleSummarizer: React.FC<ArticleSummarizerProps> = ({
  rawMarkdown,
  rawHtml,
  articleTitle,
  className = '',
  autoExpand = false,
}) => {
  const [availability, setAvailability] = useState<SummarizerAvailability | null>(null);
  const [isOpen, setIsOpen] = useState(autoExpand);
  const [summaryType, setSummaryType] = useState<SummarizerStyleType>('key-points');
  const [summaryLength, setSummaryLength] = useState<SummarizerLengthType>('medium');
  const [summaryText, setSummaryText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Check browser support on mount
  useEffect(() => {
    let isMounted = true;
    void checkSummarizerAvailability().then((status) => {
      if (isMounted) {
        setAvailability(status);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // If not supported by browser, do not render anything
  if (!availability || !isSummarizerUsable(availability)) {
    return null;
  }

  const handleStartSummary = async () => {
    if (isGenerating) return;

    setError(null);
    setSummaryText('');
    setDownloadProgress(null);
    setIsGenerating(true);
    if (!isOpen) setIsOpen(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const cleanText = prepareTextForSummarization(rawMarkdown, rawHtml);
    if (!cleanText) {
      setError('Article content is empty or could not be parsed.');
      setIsGenerating(false);
      return;
    }

    try {
      await generateArticleSummary({
        content: cleanText,
        type: summaryType,
        format: 'markdown',
        length: summaryLength,
        sharedContext: articleTitle ? `Article titled "${articleTitle}"` : undefined,
        signal: abortController.signal,
        onDownloadProgress: (pct) => {
          setDownloadProgress(pct);
        },
        onChunk: (accumulated) => {
          setSummaryText(accumulated);
          setDownloadProgress(null);
        },
      });
    } catch (err: unknown) {
      if (!abortController.signal.aborted) {
        const message = err instanceof Error ? err.message : 'Summarization failed.';
        setError(message);
      }
    } finally {
      setIsGenerating(false);
      setDownloadProgress(null);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setDownloadProgress(null);
    }
  };

  const handleCopy = () => {
    if (!summaryText) return;
    void navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isModelDownloadRequired =
    availability === 'after-download' || availability === 'downloadable';

  return (
    <div
      ref={containerRef}
      id="article-ai-summarizer"
      className={`rounded-xl border border-lime-500/30 bg-[#0a0d09]/95 backdrop-blur-md shadow-[0_4px_30px_rgba(163,230,53,0.06)] overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Top Banner / Trigger Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 md:px-6 md:py-4 border-b border-[#232f1e]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-lime-950/60 border border-lime-500/40 text-lime-400 shrink-0">
            <Sparkles size={18} className={isGenerating ? 'animate-spin' : 'animate-pulse'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-lime-400 uppercase">
                AI_SUMMARIZER
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-lime-950/40 border border-lime-500/20 text-lime-300">
                <Cpu size={10} />
                GEMINI NANO ON-DEVICE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Summarize locally in your browser with Chrome Built-in AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!summaryText && !isGenerating && (
            <button
              onClick={() => void handleStartSummary()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-lime-400 text-black hover:bg-lime-300 transition-all shadow-[0_0_15px_rgba(163,230,53,0.35)] hover:shadow-[0_0_20px_rgba(163,230,53,0.5)] cursor-pointer"
            >
              <Zap size={13} />
              <span>{isModelDownloadRequired ? 'DOWNLOAD & SUMMARIZE' : 'SUMMARIZE ARTICLE'}</span>
            </button>
          )}

          {isGenerating && (
            <button
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
            >
              <Square size={12} className="fill-rose-400" />
              <span>HALT</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg border border-[#232f1e] bg-black/40 text-slate-400 hover:text-lime-400 hover:border-lime-500/40 transition-colors cursor-pointer"
            title={isOpen ? 'Collapse panel' : 'Expand panel'}
            aria-label={isOpen ? 'Collapse summarizer panel' : 'Expand summarizer panel'}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Console Panel */}
      {isOpen && (
        <div className="p-4 md:p-6 space-y-4">
          {/* Options Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1b2517] text-xs font-mono">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider mr-1">TYPE:</span>
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  disabled={isGenerating}
                  onClick={() => setSummaryType(opt.id)}
                  title={opt.description}
                  className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                    summaryType === opt.id
                      ? 'bg-lime-400/20 border border-lime-400 text-lime-300 font-semibold'
                      : 'bg-black/40 border border-[#232f1e] text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  showOptions
                    ? 'border-lime-500/40 bg-lime-950/40 text-lime-300'
                    : 'border-[#232f1e] bg-black/40 text-slate-400 hover:text-slate-300'
                }`}
              >
                <Sliders size={12} />
                <span>LENGTH: {summaryLength.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* Length Dropdown selector if toggled */}
          {showOptions && (
            <div className="p-3 rounded-lg border border-[#232f1e] bg-black/60 flex items-center gap-2 text-xs font-mono animate-fadeIn">
              <span className="text-slate-400">SUMMARY LENGTH:</span>
              {LENGTH_OPTIONS.map((len) => (
                <button
                  key={len.id}
                  disabled={isGenerating}
                  onClick={() => {
                    setSummaryLength(len.id);
                    setShowOptions(false);
                  }}
                  className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                    summaryLength === len.id
                      ? 'bg-lime-400 text-black font-bold'
                      : 'bg-[#121910] border border-[#232f1e] text-slate-300 hover:border-lime-500/30'
                  }`}
                >
                  {len.label}
                </button>
              ))}
            </div>
          )}

          {/* Download Model Progress Bar */}
          {downloadProgress !== null && (
            <div className="p-4 rounded-lg border border-lime-500/40 bg-lime-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-lime-300">
                <span className="flex items-center gap-1.5">
                  <DownloadCloud size={14} className="animate-bounce" />
                  DOWNLOADING_GEMINI_NANO_MODEL_WEIGHTS...
                </span>
                <span className="font-bold">{downloadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-lime-500/30">
                <div
                  className="h-full bg-lime-400 transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg border border-red-900/50 bg-red-950/20 text-red-300 text-xs font-mono">
              <span className="font-bold">// ERROR: </span>
              {error}
            </div>
          )}

          {/* Summary Display Box */}
          {summaryText ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-[#232f1e] bg-black/60 font-sans text-slate-200 text-sm leading-relaxed whitespace-pre-wrap selection:bg-lime-400 selection:text-black">
                {summaryText}
                {isGenerating && (
                  <span className="inline-block w-2 h-4 ml-1 bg-lime-400 animate-pulse align-middle" />
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleStartSummary()}
                    disabled={isGenerating}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#232f1e] bg-black/40 text-slate-300 hover:text-lime-400 hover:border-lime-500/40 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RotateCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                    <span>REGENERATE</span>
                  </button>
                </div>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#232f1e] bg-black/40 text-slate-300 hover:text-lime-400 hover:border-lime-500/40 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-lime-400" />
                      <span className="text-lime-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>COPY SUMMARY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="p-8 rounded-xl border border-dashed border-[#232f1e] bg-black/40 text-center space-y-3">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-lime-950/40 border border-lime-500/30 text-lime-400 animate-spin">
                <Sparkles size={20} />
              </div>
              <p className="text-xs font-mono text-lime-400 tracking-wider uppercase">
                PROCESSING_LOCAL_INFERENCE...
              </p>
              <p className="text-[11px] font-mono text-slate-500">
                Generating {summaryType} summary via Gemini Nano
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-[#232f1e] bg-black/30 text-center space-y-3">
              <FileText size={24} className="mx-auto text-slate-600" />
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-300">
                  Ready to distill this article into {summaryType.replace('-', ' ')}
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  Select your desired style and click Generate to run on-device AI inference
                </p>
              </div>
              <button
                onClick={() => void handleStartSummary()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-lime-400 text-black hover:bg-lime-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(163,230,53,0.25)]"
              >
                <Zap size={13} />
                <span>GENERATE SUMMARY</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
