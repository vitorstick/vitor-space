import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Share2, Check, ExternalLink, Heart, MessageSquare, AlertCircle, BookOpen } from 'lucide-react';
import { getDevToArticleDetail, parseDevToTags } from '../lib/devto';
import { ArticleSummarizer } from '../components/ArticleSummarizer';
import type { DevToArticleDetail } from '../models/DevToArticle';

export const BlogPostPage = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const articleId = id || slug;
  const navigate = useNavigate();

  const [article, setArticle] = useState<DevToArticleDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [error, setError] = useState<string | null>(articleId ? null : 'Article ID parameter missing.');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!articleId) {
      return;
    }

    let isMounted = true;

    void getDevToArticleDetail(articleId)
      .then((data) => {
        if (isMounted) {
          setArticle(data);
          setLoading(false);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || `Failed to load article #${articleId}`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [articleId]);

  const handleShare = () => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070906] text-slate-100 flex items-center justify-center p-6 pt-28">
        <div className="rounded-xl border border-[#232f1e] bg-[#0a0d09]/90 p-12 text-center space-y-4 max-w-md w-full">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-lime-950/40 border border-lime-500/30 text-lime-400 animate-spin">
            <BookOpen size={28} />
          </div>
          <h2 className="text-sm font-mono text-lime-400 uppercase tracking-widest">
            DECODING_DEV_TO_LOG...
          </h2>
          <p className="text-xs font-mono text-slate-400">Fetching article #{articleId} from Dev.to API</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#070906] text-slate-100 flex items-center justify-center p-6 pt-28">
        <div className="max-w-md w-full rounded-xl border border-red-900/50 bg-[#0a0d09]/90 p-8 text-center space-y-4">
          <AlertCircle size={32} className="mx-auto text-red-400" />
          <h1 className="text-xl font-bold font-mono text-red-400">404 // ARTICLE_NOT_FOUND</h1>
          <p className="text-xs font-mono text-slate-400">
            {error || `The article ID #${articleId} could not be retrieved from Dev.to.`}
          </p>
          <button
            onClick={() => {
              void navigate('/blog');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-lime-400 text-black text-xs font-mono font-semibold rounded hover:bg-lime-300 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>RETURN TO BLOG INDEX</span>
          </button>
        </div>
      </div>
    );
  }

  const tags = parseDevToTags(article.tag_list || article.tags);

  return (
    <div className="min-h-screen bg-[#070906] text-slate-100 pt-24 md:pt-28 pb-20 px-4 md:px-8">
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

          <div className="flex items-center gap-2">
            <a
              href={article.canonical_url || article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#232f1e] bg-black/60 text-slate-300 hover:border-lime-400 hover:text-lime-300 transition-all"
            >
              <span>VIEW ON DEV.TO</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono border border-[#232f1e] bg-black/60 text-slate-300 hover:border-lime-400 hover:text-lime-300 transition-all"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-lime-400" />
                  <span className="text-lime-400">COPIED</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>SHARE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cover Image Banner */}
        {article.cover_image && (
          <div className="overflow-hidden rounded-2xl border border-[#232f1e] bg-black shadow-2xl max-h-96">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header Metadata */}
        <header className="space-y-4 border-b border-[#232f1e] pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-lime-400 font-semibold">
                <Calendar size={13} />
                {article.readable_publish_date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {article.reading_time_minutes} min read
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Heart size={13} className="text-rose-400" />
                {article.public_reactions_count} reactions
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare size={13} className="text-sky-400" />
                {article.comments_count} comments
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {article.title}
          </h1>

          <p className="text-base font-mono text-slate-300/90 leading-relaxed">
            {article.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono text-slate-400 bg-[#0d120c] border border-[#222c1e]"
              >
                <Tag size={12} className="text-lime-400/70" />
                #{tag}
              </span>
            ))}
          </div>
        </header>

        {/* Built-in AI Summarizer HUD (Rendered only when supported by browser) */}
        <ArticleSummarizer
          rawMarkdown={article.body_markdown}
          rawHtml={article.body_html}
          articleTitle={article.title}
        />

        {/* Article Body HTML */}
        <div
          className="prose prose-invert max-w-none space-y-6 text-slate-200 text-sm md:text-base font-sans leading-relaxed devto-body-content"
          dangerouslySetInnerHTML={{ __html: article.body_html }}
        />

        {/* Author Footer */}
        <footer className="mt-12 pt-8 border-t border-[#232f1e] flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0a0d09]/90 p-6 rounded-xl border">
          <div className="flex items-center gap-4">
            {article.user?.profile_image && (
              <img
                src={article.user.profile_image}
                alt={article.user.name}
                className="w-12 h-12 rounded-full border border-lime-400/50"
              />
            )}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                AUTHOR
              </span>
              <h4 className="text-base font-bold text-white font-mono">{article.user?.name}</h4>
              <p className="text-xs font-mono text-lime-400">@{article.user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://dev.to/${article.user?.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 text-xs font-mono bg-lime-400 text-black font-semibold rounded hover:bg-lime-300 transition-colors"
            >
              <span>FOLLOW ON DEV.TO</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </footer>
      </article>
    </div>
  );
};
