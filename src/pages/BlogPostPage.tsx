import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Tag, Terminal, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { posts } from '../data/posts';
import { timeline } from '../data/timeline';

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const post = useMemo(() => {
    return posts.find((p) => p.slug === slug);
  }, [slug]);

  const relatedWaypoint = useMemo(() => {
    if (!post?.relatedWaypointId) return null;
    return timeline.find((item) => item.id === post.relatedWaypointId) || null;
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#070906] text-slate-100 flex items-center justify-center p-6 pt-28">
        <div className="max-w-md w-full rounded-xl border border-red-900/50 bg-[#0a0d09]/90 p-8 text-center space-y-4">
          <Terminal size={32} className="mx-auto text-red-400" />
          <h1 className="text-xl font-bold font-mono text-red-400">404 // LOG_NOT_FOUND</h1>
          <p className="text-xs font-mono text-slate-400">
            The requested technical article slug does not exist in telemetry logs.
          </p>
          <button
            onClick={() => { void navigate('/blog'); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400 text-black text-xs font-mono font-semibold rounded hover:bg-lime-300 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO BLOG INDEX</span>
          </button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070906] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      <article className="mx-auto max-w-4xl space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-lime-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>BACK TO ARTICLES</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#232f1e] bg-black/60 text-slate-300 hover:border-lime-400 hover:text-lime-300 transition-all"
          >
            {copied ? (
              <>
                <Check size={13} className="text-lime-400" />
                <span className="text-lime-400">COPIED LINK</span>
              </>
            ) : (
              <>
                <Share2 size={13} />
                <span>SHARE</span>
              </>
            )}
          </button>
        </div>

        {/* Header Metadata */}
        <header className="space-y-4 border-b border-[#232f1e] pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded bg-lime-400/10 border border-lime-500/30 text-lime-400 font-semibold uppercase">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {post.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {post.title}
          </h1>

          <p className="text-base font-mono text-slate-300/90 leading-relaxed">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-slate-400 bg-[#0d120c] border border-[#222c1e]"
              >
                <Tag size={12} className="text-lime-400/70" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Related Waypoint Banner */}
        {relatedWaypoint && (
          <div className="flex items-center justify-between rounded-xl border border-lime-500/30 bg-lime-950/20 p-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-lime-400 shrink-0" size={20} />
              <div>
                <span className="text-[10px] font-mono text-lime-400 uppercase tracking-widest block">
                  RELATED CAREER WAYPOINT
                </span>
                <span className="text-sm font-semibold text-white font-mono">
                  {relatedWaypoint.title} ({relatedWaypoint.date})
                </span>
              </div>
            </div>
            <Link
              to={`/waypoint/${relatedWaypoint.id}`}
              className="shrink-0 px-3 py-1.5 text-xs font-mono font-semibold text-black bg-lime-400 hover:bg-lime-300 rounded transition-colors"
            >
              VIEW ON TIMELINE
            </Link>
          </div>
        )}

        {/* Main Post Body */}
        <div className="prose prose-invert max-w-none space-y-6 text-slate-200 text-sm md:text-base font-sans leading-relaxed">
          {post.content
            .trim()
            .split('\n\n')
            .map((block, idx) => {
              const blockKey = `block-${block.substring(0, 15)}-${idx}`;
              if (block.startsWith('## ')) {
                return (
                  <h2 key={blockKey} className="text-xl md:text-2xl font-bold font-mono text-lime-300 mt-8 mb-4 border-b border-[#232f1e] pb-2">
                    {block.replace('## ', '')}
                  </h2>
                );
              }
              if (block.startsWith('### ')) {
                return (
                  <h3 key={blockKey} className="text-lg font-bold font-mono text-white mt-6 mb-2">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('```')) {
                const codeContent = block.replace(/```[a-z]*/, '').replace(/```$/, '').trim();
                return (
                  <pre key={blockKey} className="p-4 rounded-xl bg-[#030503] border border-[#232f1e] overflow-x-auto font-mono text-xs text-lime-400/90 my-4">
                    <code>{codeContent}</code>
                  </pre>
                );
              }
              if (block.startsWith('- ')) {
                const listItems = block.split('\n').map((item) => item.replace('- ', ''));
                return (
                  <ul key={blockKey} className="list-disc list-inside space-y-1.5 text-slate-300 font-mono text-xs md:text-sm pl-2">
                    {listItems.map((item) => (
                      <li key={`item-${item.substring(0, 15)}`}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return <p key={blockKey}>{block}</p>;
            })}
        </div>

        {/* Author Footer */}
        <footer className="mt-12 pt-8 border-t border-[#232f1e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0a0d09]/90 p-6 rounded-xl border">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">AUTHOR</span>
            <h4 className="text-base font-bold text-white font-mono">{post.author.name}</h4>
            <p className="text-xs font-mono text-lime-400">{post.author.role}</p>
          </div>

          <Link
            to="/blog"
            className="px-4 py-2 text-xs font-mono bg-black/60 border border-[#232f1e] text-slate-300 hover:border-lime-400 hover:text-white rounded transition-colors"
          >
            EXPLORE ALL ARTICLES
          </Link>
        </footer>
      </article>
    </div>
  );
};
