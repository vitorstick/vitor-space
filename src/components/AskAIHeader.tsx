import { useState } from 'react';
import {
  Bot,
  Cpu,
  HelpCircle,
  ChevronUp,
  DownloadCloud,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { isLanguageModelUsable, type AIAvailabilityStatus } from '../lib/aiAssistant';

type AskAIHeaderProps = {
  availability: AIAvailabilityStatus | null;
  useSimulation: boolean;
  onToggleSimulation: () => void;
  downloadProgress: number | null;
};

export const AskAIHeader = ({
  availability,
  useSimulation,
  onToggleSimulation,
  downloadProgress,
}: AskAIHeaderProps) => {
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const isModelDownloadRequired =
    availability === 'after-download' || availability === 'downloadable';

  return (
    <div className="rounded-xl border border-lime-500/20 bg-[#0a0d09]/90 backdrop-blur-sm p-3.5 md:p-4 shadow-sm space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Micro Badges */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-lime-950/50 border border-lime-500/30 text-lime-400">
            <Bot size={16} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-sm md:text-base font-bold font-mono tracking-wide text-white uppercase">
                ASK_VITOR // NEURAL_ASSISTANT
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-lime-950/40 border border-lime-500/20 text-lime-300">
                <Cpu size={10} />
                {useSimulation ? 'SIMULATED' : 'GEMINI NANO'}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 hidden sm:block">
              Query Vitor's career timeline, tech stacks, and milestones
            </p>
          </div>
        </div>

        {/* Status Indicator & Info Toggle */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#232f1e] bg-black/60 text-[11px] font-mono">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                !useSimulation && isLanguageModelUsable(availability || 'unsupported')
                  ? 'bg-lime-400 shadow-[0_0_6px_#a3e635]'
                  : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
              }`}
            />
            <span className="text-slate-300 text-[10px]">
              {!useSimulation && isLanguageModelUsable(availability || 'unsupported')
                ? isModelDownloadRequired
                  ? 'DOWNLOADABLE'
                  : 'ON-DEVICE'
                : 'SIMULATION'}
            </span>
          </div>

          <button
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="p-1.5 rounded-md border border-[#232f1e] bg-black/40 text-slate-400 hover:text-lime-300 hover:border-lime-500/30 transition-colors"
            title="Chrome Built-in AI info & Setup"
            aria-label="Toggle setup guide"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Download Progress Bar */}
      {downloadProgress !== null && (
        <div className="p-2.5 rounded-lg border border-lime-500/30 bg-lime-950/20 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px] font-mono text-lime-300">
            <span className="flex items-center gap-1.5">
              <DownloadCloud size={13} className="animate-bounce" />
              DOWNLOADING_MODEL_WEIGHTS...
            </span>
            <span className="font-bold">{downloadProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-lime-500/20">
            <div
              className="h-full bg-lime-400 transition-all duration-300 shadow-[0_0_8px_#a3e635]"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Chrome AI Setup Guide (Collapsible) */}
      {showSetupGuide && (
        <div className="p-3 rounded-lg border border-[#232f1e] bg-black/70 space-y-2 text-[11px] font-mono text-slate-300 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#232f1e] pb-1.5 text-lime-400 font-bold">
            <span className="flex items-center gap-1">
              <Info size={13} />
              HOW CHROME LOCAL AI WORKS
            </span>
            <button
              onClick={() => setShowSetupGuide(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              <ChevronUp size={14} />
            </button>
          </div>
          <p className="leading-relaxed text-slate-400 text-[11px]">
            Uses Chrome's experimental <strong>Prompt API (Gemini Nano)</strong> for on-device inference inside your browser. No data leaves your machine.
          </p>
          <div className="space-y-1 bg-[#050804] p-2.5 rounded border border-[#1b2517] text-[10px]">
            <p className="text-white font-semibold">Setup instructions:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-400">
              <li>Use Google Chrome (version 128+ or Chrome Canary/Dev).</li>
              <li>
                Set <code className="text-lime-300 bg-lime-950/60 px-1 py-0.5 rounded">chrome://flags/#prompt-api-for-gemini-nano</code> to <strong>Enabled</strong>.
              </li>
              <li>
                Set <code className="text-lime-300 bg-lime-950/60 px-1 py-0.5 rounded">chrome://flags/#optimization-guide-on-device-model</code> to <strong>Enabled BypassPerfRequirement</strong>.
              </li>
              <li>Restart Chrome and verify at <code className="text-lime-300 bg-lime-950/60 px-1 py-0.5 rounded">chrome://components</code>.</li>
            </ol>
          </div>
          <div className="flex items-center justify-between pt-0.5 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-lime-400" />
              Grounded on Vitor's timeline data
            </span>
            <button
              onClick={onToggleSimulation}
              className="text-lime-400 hover:underline cursor-pointer"
            >
              {useSimulation ? 'Switch to Chrome AI Mode' : 'Switch to Fallback Mode'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
