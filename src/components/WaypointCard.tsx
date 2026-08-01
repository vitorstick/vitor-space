import { Building2, Code2, Mountain, Compass } from 'lucide-react';
import type { TimelineType } from '../models/TimelineItem';

    

interface WaypointCardProps {
  type: TimelineType;
  date: string;
  title: string;
  top: string;  // e.g., '45%' for absolute positioning on the map
  left: string; // e.g., '60%'
  isReached?: boolean;
}

export const WaypointCard: React.FC<WaypointCardProps> = ({ 
  type, 
  date,
  title,
  top, 
  left,
  isReached = false
}) => {
  // Map the type to the corresponding icon
  const getIcon = (): React.ReactNode => {
    switch (type) {
      case 'location': return <Building2 size={20} className={isReached ? "text-lime-300" : "text-lime-500/70"} />;
      case 'code': return <Code2 size={20} className={isReached ? "text-lime-300" : "text-lime-500/70"} />;
      case 'project': return <Mountain size={20} className={isReached ? "text-lime-300" : "text-lime-500/70"} />;
      default: return <Compass size={20} className={isReached ? "text-lime-300" : "text-lime-500/70"} />;
    }
  };

  return (
    <div 
      className={`absolute flex items-center gap-2 p-2 bg-[#1A1A1A]/95 border rounded-md shadow-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-lime-400 cursor-pointer group z-10 ${
        isReached ? 'border-lime-400/90 shadow-[0_0_15px_rgba(163,230,53,0.25)]' : 'border-[#333]'
      }`}
      style={{ top, left, transform: 'translate(-50%, calc(-100% - 16px))' }} // Pin dot rests precisely on path coordinate
    >
      {/* Icon Container with subtle neon glow on hover or reached state */}
      <div className={`flex items-center justify-center w-10 h-10 bg-black border rounded transition-all ${
        isReached ? 'border-lime-400/80 shadow-[0_0_10px_rgba(163,230,53,0.4)]' : 'border-[#333] group-hover:shadow-[0_0_10px_rgba(163,230,53,0.3)]'
      }`}>
        {getIcon()}
      </div>

      {/* Text Content */}
      <div className="flex flex-col pr-2">
        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-mono">
          {date}
        </span>
        <span className={`text-sm font-bold tracking-wide transition-colors ${
          isReached ? 'text-lime-100' : 'text-white'
        }`}>
          {title}
        </span>
      </div>

      {/* Map Connection Pin (The little line connecting to the path) */}
      <div className={`absolute -bottom-4 left-1/2 w-px h-4 transition-colors ${
        isReached ? 'bg-lime-400' : 'bg-[#333] group-hover:bg-lime-400'
      }`} />
      <div className={`absolute -bottom-5 left-1/2 w-2 h-2 rounded-full bg-black border-2 -translate-x-[3px] transition-colors ${
        isReached ? 'border-lime-400 bg-lime-400/30' : 'border-[#333] group-hover:border-lime-400'
      }`} />
    </div>
  );
};

// --- Example Usage ---
//
// <div className="relative w-full h-screen bg-[#111] overflow-hidden">
//   {/* Your Topographical SVG Background Goes Here */}
//   
//   <WaypointCard 
//     type="location"
//     subtitle="Relocation:"
//     title="Amsterdam"
//     top="65%"
//     left="55%"
//   />
// </div>