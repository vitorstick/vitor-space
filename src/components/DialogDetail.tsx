import type { TimelineItem } from "../models/TimelineItem";
// Using lucide-react for the close icon to match the previous component
import { Building2, CalendarDays, MapPinCheck } from "lucide-react"; 

type DialogDetailProps = {
    entry: TimelineItem;
    onClose: () => void;
};

export const DialogDetail = ({ entry, onClose }: DialogDetailProps) => {
    return (
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-brightness-50">
            {/* The subtle grid pattern backdrop */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            {/* // 2. Main Dialog Box: Asymmetric cuts and thin glowing lines */}
            <div className="relative w-full max-w-xl p-10 overflow-hidden bg-[#121412]/80 shadow-[0_0_60px_rgba(0,0,0,0.8)] backdrop-blur-sm group" 
                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)' }}>
                
                {/* 3. Integrated Vector Connectors (Stylized lines anchoring to origin) */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-l-2 border-t-2 border-lime-400 group-hover:shadow-[0_0_10px_rgba(163,230,53,0.5)] transition-all"></div>
                <div className="absolute top-2 left-2 text-[8px] font-mono text-lime-400 tracking-wider">SYSTEM_READOUT v2.1</div>

                {/* 4. Amber Close button indicator */}
                <button
                    className="absolute top-4 right-4 px-2 py-1 border border-amber-600/60 font-mono text-xs text-amber-500 hover:bg-amber-950 transition-colors z-10"
                    onClick={onClose}
                    aria-label="Close dialog"
                >
                    CLOSE [X]
                </button>

                <div className="relative z-10 flex flex-col gap-6">
                    {/* Header: Title */}
                    <div className="flex flex-col gap-1 pr-16 border-b border-[#333] pb-4">
                        <span className="text-sm font-mono tracking-widest text-gray-500 uppercase">LOCATION_DEEP_DIVE:</span>
                        <h2 className="text-3xl font-bold tracking-tight text-white uppercase">
                            {entry.title}
                        </h2>
                    </div>

                    {/* Technical Readout Layout (Columns) */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-b border-[#333] pb-6">
                        {/* TYPE telemetry */}
                        <div className="flex items-center gap-3 p-3 bg-black/40 border border-[#222]">
                            <Building2 size={24} className="text-lime-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-gray-500">TYPE:</span>
                                <span className="text-base font-semibold text-white uppercase">{entry.type}</span>
                            </div>
                        </div>

                        {/* DATE telemetry */}
                        <div className="flex items-center gap-3 p-3 bg-black/40 border border-[#222]">
                            <CalendarDays size={24} className="text-lime-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-gray-500">DATE:</span>
                                <span className="text-base font-semibold text-white uppercase">{entry.date}</span>
                            </div>
                        </div>

                        {/* STATUS telemetry (New placeholder) */}
                        <div className="flex items-center gap-3 p-3 bg-black/40 border border-[#222]">
                            <MapPinCheck size={24} className="text-lime-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-mono text-gray-500">STATUS:</span>
                                <span className="text-base font-semibold text-amber-500 uppercase">DEPLOYED</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Amber Monospace Content */}
                    <div className="flex flex-col gap-2 pt-2 text-sm leading-relaxed text-amber-300 font-mono">
                        <span className="text-xs text-gray-500">_DESCRIPTION:</span>
                        {/* Example description telemetry text */}
                        <p>Waypoint details and project telemetry loaded successfully. Logistics, integration, and cultural adaptation complete.</p>
                        <p>_LOG: Local coordination synchronized 04:21 UTC.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};