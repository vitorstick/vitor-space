import { useState } from 'react';
import {
  Bot,
  Cpu,
  HelpCircle,
  ChevronUp,
  DownloadCloud,
  Info,
  ShieldCheck,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  isLanguageModelUsable,
  DEFAULT_AI_TEMPERATURE,
  type AIAvailabilityStatus,
} from '../lib/aiAssistant';

type AskAIHeaderProps = {
  availability: AIAvailabilityStatus | null;
  useSimulation: boolean;
  onToggleSimulation: () => void;
  downloadProgress: number | null;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
};

export const AskAIHeader = ({
  availability,
  useSimulation,
  onToggleSimulation,
  downloadProgress,
  temperature,
  onTemperatureChange,
}: AskAIHeaderProps) => {
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [showParams, setShowParams] = useState(false);

  const isModelDownloadRequired =
    availability === 'after-download' || availability === 'downloadable';

  const PRESETS = [
    { label: '0.0 (Strict Facts)', value: 0.0, desc: 'Greedy decoding: zero speculation' },
    { label: '0.1 (Default)', value: 0.1, desc: 'Factual & concise grounded answers' },
    { label: '0.4 (Balanced)', value: 0.4, desc: 'Descriptive & conversational flow' },
    { label: '0.75 (Speculative)', value: 0.75, desc: 'Creative extrapolation & assumptions' },
    { label: '1.0 (Inventive / Max)', value: 1.0, desc: 'Unconstrained hypotheses & ideas' },
  ];

  const getTemperatureLabel = (val: number) => {
    if (val === 0.0) return 'DETERMINISTIC // GREEDY';
    if (val <= 0.2) return 'GROUNDED // STRICT FACTS';
    if (val <= 0.5) return 'BALANCED // DESCRIPTIVE';
    if (val <= 0.8) return 'SPECULATIVE // ASSUMPTIONS ENABLED';
    return 'HIGH CREATIVITY // UNCONSTRAINED';
  };

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
              <button
                type="button"
                onClick={() => setShowParams((prev) => !prev)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                  showParams || temperature !== DEFAULT_AI_TEMPERATURE
                    ? 'bg-lime-400 text-black border-lime-300 font-bold shadow-[0_0_8px_rgba(163,230,53,0.3)]'
                    : 'bg-[#12180f] text-slate-300 border-[#232f1e] hover:border-lime-500/40 hover:text-lime-300'
                }`}
                title="Adjust Temperature & Sampling"
              >
                <SlidersHorizontal size={10} />
                <span>TEMP: {temperature.toFixed(2)}</span>
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5 hidden sm:block">
              Query Vitor's career timeline, tech stacks, and milestones
            </p>
          </div>
        </div>

        {/* Status Indicator & Controls */}
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
            type="button"
            onClick={() => setShowParams((prev) => !prev)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              showParams
                ? 'border-lime-500/60 bg-lime-950/40 text-lime-300'
                : 'border-[#232f1e] bg-black/40 text-slate-400 hover:text-lime-300 hover:border-lime-500/30'
            }`}
            title="Adjust Temperature & Sampling parameters"
            aria-label="Toggle temperature settings"
          >
            <SlidersHorizontal size={14} />
          </button>

          <button
            type="button"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              showSetupGuide
                ? 'border-lime-500/60 bg-lime-950/40 text-lime-300'
                : 'border-[#232f1e] bg-black/40 text-slate-400 hover:text-lime-300 hover:border-lime-500/30'
            }`}
            title="Chrome Built-in AI info & Setup"
            aria-label="Toggle setup guide"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Temperature & Parameters Control Panel (Collapsible) */}
      {showParams && (
        <div className="p-3 rounded-lg border border-lime-500/30 bg-black/80 space-y-3 text-[11px] font-mono text-slate-300 animate-fadeIn shadow-lg">
          <div className="flex items-center justify-between border-b border-[#232f1e] pb-1.5 text-lime-400 font-bold">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal size={13} />
              MODEL_PARAMETERS // TEMPERATURE_CONTROLLER
            </span>
            <div className="flex items-center gap-2">
              {temperature !== DEFAULT_AI_TEMPERATURE && (
                <button
                  type="button"
                  onClick={() => onTemperatureChange(DEFAULT_AI_TEMPERATURE)}
                  className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-lime-300 transition-colors cursor-pointer"
                  title="Reset to default (0.1)"
                >
                  <RotateCcw size={10} />
                  <span>RESET (0.1)</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowParams(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>

          {/* Slider & Value Display */}
          <div className="space-y-2 bg-[#050804] p-3 rounded-lg border border-[#1b2517]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-xs">TEMPERATURE</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-lime-950/60 border border-lime-500/30 text-lime-300 font-mono">
                  {getTemperatureLabel(temperature)}
                </span>
              </div>
              <div className="text-sm font-bold font-mono text-lime-400 bg-black px-2 py-0.5 rounded border border-lime-500/40 shadow-[0_0_8px_rgba(163,230,53,0.2)]">
                {temperature.toFixed(2)}
              </div>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                className="w-full accent-lime-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                <span>0.0 (Strict / Factual)</span>
                <span>0.5 (Balanced)</span>
                <span>1.0 (Creative)</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="pt-2 border-t border-[#1a2316] flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono">PRESETS:</span>
              {PRESETS.map((preset) => {
                const isActive = Math.abs(temperature - preset.value) < 0.001;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => onTemperatureChange(preset.value)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-lime-400 text-black border-lime-300 font-bold shadow-[0_0_6px_rgba(163,230,53,0.3)]'
                        : 'bg-black/50 text-slate-300 border-[#232f1e] hover:border-lime-500/40 hover:text-white'
                    }`}
                    title={preset.desc}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
            <Sparkles size={12} className="text-lime-400 shrink-0 mt-0.5" />
            <span>
              <strong>How it works:</strong> At <strong>T &le; 0.2</strong>, the prompt enforces strict timeline fact-checking and greedy token sampling (topK=1). At <strong>T &ge; 0.6</strong>, candidate diversity unlocks (topK up to 40) and system instructions explicitly permit the model to make creative assumptions, hypothesize future projects, and extrapolate beyond verified milestones.
            </span>
          </div>
        </div>
      )}

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
              type="button"
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
              type="button"
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
