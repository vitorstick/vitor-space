import { Link } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-[#070906] text-slate-100 flex items-center justify-center p-6 pt-28">
      <div className="max-w-md w-full rounded-xl border border-[#232f1e] bg-[#0a0d09]/90 p-8 text-center space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-red-950/40 border border-red-500/30 text-red-400">
          <Terminal size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold font-mono text-white tracking-wider">404</h1>
          <h2 className="text-sm font-mono text-lime-400 uppercase tracking-widest">
            ROUTE_OUT_OF_BOUNDS
          </h2>
          <p className="text-xs font-mono text-slate-400">
            The telemetry coordinate you requested does not exist on this vector path.
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-lime-400 text-black text-xs font-mono font-bold rounded-lg hover:bg-lime-300 transition-colors shadow-[0_0_12px_rgba(163,230,53,0.3)]"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO TIMELINE</span>
          </Link>

          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black/60 border border-[#232f1e] text-slate-300 hover:text-white text-xs font-mono rounded-lg hover:border-lime-500/50 transition-colors"
          >
            <span>VIEW BLOG ARTICLES</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
