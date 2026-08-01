import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Search, Tag, Terminal, ExternalLink, Heart, MessageSquare, AlertCircle } from 'lucide-react';
import { getDevToArticles, parseDevToTags } from '../lib/devto';
import type { DevToArticleListItem } from '../models/DevToArticle';

export const BlogListPage = () => {
  const [articles, setArticles] = useState<DevToArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getDevToArticles('vitorstick')
      .then((data) => {
        if (isMounted) {
          setArticles(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (isMounted) {
          setError(err.message || 'Failed to load Dev.to articles.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((art) => {
      const tags = parseDevToTags(art.tag_list || art.tags);
      tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const tags = parseDevToTags(art.tag_list || art.tags);
      const matchesTag = selectedTag === 'all' || tags.includes(selectedTag);

      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTag && matchesSearch;
    });
  }, [articles, searchQuery, selectedTag]);

  return (
    <div className="min-h-screen bg-[#070906] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col gap-3 border-b border-[#232f1e] pb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-lime-400 uppercase">
              <Terminal size={14} className="animate-pulse" />
              <span>DEV.TO_FEED // @VITORSTICK</span>
            </div>

            <a
              href="https://dev.to/vitorstick"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-lime-300 transition-colors"
            >
              <span>DEV.TO PROFILE</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
            Engineering Logs & Articles
          </h1>

          <p className="text-sm font-mono text-slate-400 max-w-2xl">
            Live technical articles, Web & Mobile development guides, and UI experiment logs fetched directly from Dev.to API.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0d120c]/90 p-4 rounded-xl border border-[#232f1e]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search Dev.to articles by keyword or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070906] border border-[#232f1e] rounded-lg pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-lime-400/80 transition-all"
            />
          </div>

          {/* Tag Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                selectedTag === 'all'
                  ? 'bg-lime-400 text-black font-semibold shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                  : 'bg-black/60 text-slate-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-white'
              }`}
            >
              ALL ({articles.length})
            </button>

            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono uppercase transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-lime-400 text-black font-semibold shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                    : 'bg-black/60 text-slate-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-white'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-[#232f1e] bg-[#0a0d09]/80 p-12 text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-lime-950/40 border border-lime-500/30 text-lime-400 animate-spin">
              <BookOpen size={24} />
            </div>
            <p className="font-mono text-lime-400 text-sm tracking-wider uppercase">
              FETCHING_DEV_TO_ARTICLES...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-900/50 bg-[#0a0d09]/90 p-8 text-center space-y-3">
            <AlertCircle size={28} className="mx-auto text-red-400" />
            <h2 className="text-sm font-mono text-red-400 uppercase">DEV_TO_API_ERROR</h2>
            <p className="text-xs font-mono text-slate-400">{error}</p>
          </div>
        )}

        {/* Article Cards Grid */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => {
              const tags = parseDevToTags(article.tag_list || article.tags);
              const coverImg = article.cover_image || article.social_image;

              return (
                <article
                  key={article.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#232f1e] bg-[#0a0d09]/90 backdrop-blur-md transition-all duration-300 hover:border-lime-500/50 hover:shadow-[0_0_24px_rgba(163,230,53,0.12)]"
                >
                  {/* Cover Image Banner */}
                  {coverImg && (
                    <div className="h-44 w-full overflow-hidden border-b border-[#1f2a1a] bg-black">
                      <img
                        src={coverImg}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      {/* Metadata row */}
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-lime-400" />
                          {article.readable_publish_date}
                        </span>

                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-lime-400" />
                          {article.reading_time_minutes} min read
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-bold text-slate-100 group-hover:text-lime-300 transition-colors leading-snug">
                        <Link to={`/blog/${article.id}`} className="focus:outline-none">
                          {article.title}
                        </Link>
                      </h2>

                      {/* Description */}
                      <p className="text-xs text-slate-300/80 leading-relaxed line-clamp-3">
                        {article.description}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-[#1a2316]">
                      {/* Tag List */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-black/40 border border-[#222c1e]"
                          >
                            <Tag size={10} className="text-lime-400/70" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Card Footer with reactions & read link */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-3 text-slate-400">
                          <span className="flex items-center gap-1">
                            <Heart size={12} className="text-rose-400" />
                            {article.public_reactions_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} className="text-sky-400" />
                            {article.comments_count}
                          </span>
                        </div>

                        <Link
                          to={`/blog/${article.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-lime-400 hover:text-lime-300 group-hover:translate-x-1 transition-all"
                        >
                          <span>READ ARTICLE</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty Search Result */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="rounded-xl border border-[#232f1e] bg-[#0a0d09]/80 p-12 text-center space-y-4">
            <p className="font-mono text-slate-400 text-sm">
              NO DEV.TO ARTICLES MATCHED FILTER: "{searchQuery || selectedTag}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTag('all');
              }}
              className="px-4 py-2 text-xs font-mono bg-lime-400 text-black font-semibold rounded hover:bg-lime-300 transition-colors"
            >
              RESET FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
