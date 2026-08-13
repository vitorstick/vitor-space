import { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Send,
  Square,
  Cpu,
  DownloadCloud,
  Terminal,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  HelpCircle,
  ChevronUp,
  ShieldCheck,
  Info,
} from 'lucide-react';
import {
  checkLanguageModelAvailability,
  isLanguageModelUsable,
  askTimelineAssistant,
  generateSimulatedAnswer,
  type AIAvailabilityStatus,
  type ChatMessage,
} from '../lib/aiAssistant';

const SUGGESTED_PROMPTS = [
  'What technical stack does Vitor specialize in?',
  'What is Vitor\'s geographic journey and relocations?',
  'Where did Vitor work?',
  'How can I connect with Vitor or view his profiles?',
];

export const AskAIPage = () => {
  const [availability, setAvailability] = useState<AIAvailabilityStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [useSimulation, setUseSimulation] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Check browser support on load
  useEffect(() => {
    let isMounted = true;
    void checkLanguageModelAvailability().then((status) => {
      if (isMounted) {
        setAvailability(status);
        if (!isLanguageModelUsable(status)) {
          setUseSimulation(true);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll on new message content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputText).trim();
    if (!text || isGenerating) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isStreaming: true,
      },
    ];

    setMessages(newMessages);
    setInputText('');
    setIsGenerating(true);
    setDownloadProgress(null);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const isLiveAIUsable = availability && isLanguageModelUsable(availability) && !useSimulation;

    if (!isLiveAIUsable) {
      // Simulation mode with simulated streaming
      setTimeout(() => {
        const simAnswer = generateSimulatedAnswer(text);
        let charIndex = 0;
        const interval = setInterval(() => {
          if (abortController.signal.aborted) {
            clearInterval(interval);
            setIsGenerating(false);
            return;
          }
          charIndex += 4;
          const chunk = simAnswer.slice(0, charIndex);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: chunk, isStreaming: charIndex < simAnswer.length }
                : msg
            )
          );
          if (charIndex >= simAnswer.length) {
            clearInterval(interval);
            setIsGenerating(false);
          }
        }, 20);
      }, 350);
      return;
    }

    try {
      const history = messages.map((m) => ({
        role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.content,
      }));

      await askTimelineAssistant({
        prompt: text,
        conversationHistory: history,
        signal: abortController.signal,
        onDownloadProgress: (pct) => {
          setDownloadProgress(pct);
        },
        onChunk: (accumulated) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulated, isStreaming: true }
                : msg
            )
          );
        },
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (err: unknown) {
      if (!abortController.signal.aborted) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Error executing prompt against Gemini Nano.';
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                ...msg,
                content: `⚠️ // TELEMETRY_ERROR: ${errorMsg}\n\nSwitching to simulated telemetry assistant mode.`,
                isStreaming: false,
              }
              : msg
          )
        );
        setUseSimulation(true);
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
      setMessages((prev) =>
        prev.map((msg) => (msg.isStreaming ? { ...msg, isStreaming: false } : msg))
      );
    }
  };

  const handleClearChat = () => {
    handleStop();
    setMessages([]);
  };

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isModelDownloadRequired =
    availability === 'after-download' || availability === 'downloadable';

  return (
    <div className="min-h-screen bg-[#070906] text-slate-100 pt-24 md:pt-28 pb-16 px-4 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header Card */}
        <div className="rounded-2xl border border-lime-500/30 bg-[#0a0d09]/95 backdrop-blur-md p-6 md:p-8 shadow-[0_4px_30px_rgba(163,230,53,0.08)] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-lime-950/60 border border-lime-500/40 text-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                <Bot size={24} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold font-mono tracking-wide text-white uppercase">
                    ASK_VITOR // NEURAL_ASSISTANT
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-lime-950/50 border border-lime-500/30 text-lime-300">
                    <Cpu size={12} />
                    {useSimulation ? 'SIMULATED TELEMETRY' : 'GEMINI NANO LOCAL'}
                  </span>
                </div>
                <p className="text-xs md:text-sm font-mono text-slate-400 mt-0.5">
                  Ask questions about Vitor's career timeline, tech stacks, roles, and milestones
                </p>
              </div>
            </div>

            {/* Status Indicator Badge */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#232f1e] bg-black/60 text-xs font-mono">
                <span
                  className={`w-2 h-2 rounded-full ${!useSimulation && isLanguageModelUsable(availability || 'unsupported')
                    ? 'bg-lime-400 shadow-[0_0_8px_#a3e635]'
                    : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                    }`}
                />
                <span className="text-slate-300">
                  {!useSimulation && isLanguageModelUsable(availability || 'unsupported')
                    ? isModelDownloadRequired
                      ? 'DOWNLOADABLE'
                      : 'ON-DEVICE ACTIVE'
                    : 'SIMULATION MODE'}
                </span>
              </div>

              <button
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="p-2 rounded-lg border border-[#232f1e] bg-black/40 text-slate-400 hover:text-lime-300 hover:border-lime-500/40 transition-colors"
                title="Chrome Built-in AI info & Setup"
                aria-label="Toggle setup guide"
              >
                <HelpCircle size={16} />
              </button>
            </div>
          </div>

          {/* Download Progress Bar */}
          {downloadProgress !== null && (
            <div className="p-4 rounded-xl border border-lime-500/40 bg-lime-950/30 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs font-mono text-lime-300">
                <span className="flex items-center gap-2">
                  <DownloadCloud size={16} className="animate-bounce" />
                  DOWNLOADING_GEMINI_NANO_MODEL_WEIGHTS...
                </span>
                <span className="font-bold">{downloadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-lime-500/30">
                <div
                  className="h-full bg-lime-400 transition-all duration-300 shadow-[0_0_10px_#a3e635]"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Chrome AI Setup Guide (Collapsible) */}
          {showSetupGuide && (
            <div className="p-4 md:p-5 rounded-xl border border-[#232f1e] bg-black/80 space-y-3 text-xs font-mono text-slate-300 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#232f1e] pb-2 text-lime-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <Info size={14} />
                  HOW CHROME LOCAL AI WORKS
                </span>
                <button
                  onClick={() => setShowSetupGuide(false)}
                  className="text-slate-500 hover:text-slate-300"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
              <p className="leading-relaxed text-slate-400">
                This feature uses Chrome's experimental <strong>Prompt API (Gemini Nano)</strong> to run on-device inference directly inside your browser. No data leaves your machine.
              </p>
              <div className="space-y-2 bg-[#050804] p-3 rounded-lg border border-[#1b2517]">
                <p className="text-white font-semibold">To enable Chrome Built-in AI:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Use Google Chrome (version 128+ or Chrome Canary/Dev).</li>
                  <li>
                    Navigate to <code className="text-lime-300 bg-lime-950/60 px-1 py-0.5 rounded">chrome://flags/#prompt-api-for-gemini-nano</code> and set to <strong>Enabled</strong>.
                  </li>
                  <li>
                    Navigate to <code className="text-lime-300 bg-lime-950/60 px-1 py-0.5 rounded">chrome://flags/#optimization-guide-on-device-model</code> and set to <strong>Enabled BypassPerfRequirement</strong>.
                  </li>
                  <li>Restart Chrome and visit <code className="text-lime-300 bg-lime-950/60 px-1 py-0.5 rounded">chrome://components</code> to check <em>Optimization Guide On Device Model</em>.</li>
                </ol>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-lime-400" />
                  Grounded on verified data from Vitor's timeline
                </span>
                <button
                  onClick={() => setUseSimulation(!useSimulation)}
                  className="text-lime-400 hover:underline cursor-pointer"
                >
                  {useSimulation ? 'Switch to Chrome AI Mode' : 'Switch to Fallback Mode'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Conversation Box */}
        <div className="rounded-2xl border border-[#232f1e] bg-[#0a0d09]/95 backdrop-blur-md min-h-[420px] max-h-[600px] flex flex-col overflow-hidden shadow-2xl">
          {/* Top Bar inside Chat */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#232f1e] bg-black/40 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal size={14} className="text-lime-400" />
              <span>TERMINAL_SESSION // GROUNDED_KNOWLEDGE</span>
            </div>
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                <span>CLEAR SESSION</span>
              </button>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 space-y-6">
                <div className="p-4 rounded-2xl bg-lime-950/30 border border-lime-500/20 text-lime-400 shadow-[0_0_25px_rgba(163,230,53,0.15)]">
                  <Sparkles size={32} className="animate-pulse" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base md:text-lg font-bold text-white font-mono uppercase">
                    INITIALIZE NEURAL QUERY
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 font-mono">
                    Select a suggested telemetry prompt below or type your custom query to analyze Vitor's career journey.
                  </p>
                </div>

                {/* Suggested Prompt Chips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl text-left pt-2">
                  {SUGGESTED_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => void handleSendMessage(prompt)}
                      className="group flex items-start gap-2 p-3 rounded-xl border border-[#232f1e] bg-black/40 hover:bg-lime-950/30 hover:border-lime-500/40 transition-all text-xs font-mono text-slate-300 hover:text-white cursor-pointer"
                    >
                      <Zap size={14} className="text-lime-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 md:gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-lime-950/70 border border-lime-500/40 text-lime-400 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(163,230,53,0.2)]">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 md:p-5 text-sm leading-relaxed space-y-2 ${msg.role === 'user'
                      ? 'bg-lime-950/40 border border-lime-500/40 text-lime-100 rounded-tr-none'
                      : 'bg-black/60 border border-[#232f1e] text-slate-200 rounded-tl-none shadow-lg'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-slate-500 pb-1 border-b border-white/5">
                      <span>{msg.role === 'user' ? 'OPERATOR' : 'TELEMETRY_AI'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans selection:bg-lime-400 selection:text-black">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-lime-400 animate-pulse align-middle" />
                      )}
                    </div>

                    {msg.role === 'assistant' && msg.content && !msg.isStreaming && (
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-lime-300 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check size={12} className="text-lime-400" />
                              <span className="text-lime-400">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-black/60 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts mini-bar if chat is active */}
          {messages.length > 0 && !isGenerating && (
            <div className="px-4 py-2 border-t border-[#1b2517] bg-black/40 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-mono">
              <span className="text-[10px] text-slate-500 shrink-0 uppercase">SUGGESTIONS:</span>
              {SUGGESTED_PROMPTS.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => void handleSendMessage(p)}
                  className="shrink-0 px-2.5 py-1 rounded-md border border-[#232f1e] bg-[#0c100b] hover:border-lime-500/40 text-slate-400 hover:text-lime-300 transition-colors text-[11px] cursor-pointer truncate max-w-[220px]"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input Console Bar */}
          <div className="p-4 border-t border-[#232f1e] bg-[#080b07]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  rows={1}
                  placeholder="Ask a question about Vitor's career, tech stacks, companies..."
                  className="w-full bg-black/70 border border-[#232f1e] focus:border-lime-400 rounded-xl px-4 py-3 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-lime-400 font-mono resize-none transition-all pr-10"
                />
              </div>

              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition-all text-xs font-mono font-bold cursor-pointer"
                >
                  <Square size={14} className="fill-rose-400" />
                  <span>HALT</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-xl bg-lime-400 text-black font-mono font-bold text-xs hover:bg-lime-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] hover:shadow-[0_0_20px_rgba(163,230,53,0.5)] cursor-pointer"
                >
                  <span>TRANSMIT</span>
                  <Send size={13} />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
