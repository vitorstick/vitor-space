import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Clock, Search, Tag, Terminal, ArrowRight } from 'lucide-react';
import { posts } from '../data/posts';

export const BlogListPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' || post.category === selectedCategory;

      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', label: 'ALL_LOGS' },
    { id: 'canvas', label: 'CANVAS_2D' },
    { id: 'architecture', label: 'ARCHITECTURE' },
    { id: 'performance', label: 'PERFORMANCE' },
    { id: 'career', label: 'CAREER & CULTURE' },
  ];

  return (
    <div className="min-h-screen bg-[#070906] text-slate-100 pt-28 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Title Section */}
        <div className="flex flex-col gap-3 border-b border-[#232f1e] pb-8">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-lime-400 uppercase">
            <Terminal size={14} className="animate-pulse" />
            <span>ENGINEERING_LOGS // TECHNICAL_ARTICLES</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
            Technical Field Notes
          </h1>

          <p className="text-sm font-mono text-slate-400 max-w-2xl">
            In-depth analysis, architecture design patterns, high-performance canvas algorithms, and frontend leadership insights by Vitor Rodrigues.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0d120c]/90 p-4 rounded-xl border border-[#232f1e]">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by topic, keyword, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070906] border border-[#232f1e] rounded-lg pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-lime-400/80 transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-lime-400 text-black font-semibold shadow-[0_0_12px_rgba(163,230,53,0.3)]'
                    : 'bg-black/60 text-slate-400 border border-[#222c1e] hover:border-lime-500/50 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group relative flex flex-col justify-between rounded-xl border border-[#232f1e] bg-[#0a0d09]/90 p-6 backdrop-blur-md transition-all duration-300 hover:border-lime-500/50 hover:shadow-[0_0_24px_rgba(163,230,53,0.12)]"
              >
                <div className="space-y-4">
                  {/* Article Metadata */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-lime-400 uppercase tracking-wider">
                      <BookOpen size={13} />
                      {post.category}
                    </span>

                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Title & Link */}
                  <h2 className="text-xl font-bold text-slate-100 group-hover:text-lime-300 transition-colors leading-snug">
                    <Link to={`/blog/${post.slug}`} className="focus:outline-none">
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-xs text-slate-300/80 leading-relaxed font-sans">
                    {post.excerpt}
                  </p>

                  {/* Tag List */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-black/40 border border-[#222c1e]"
                      >
                        <Tag size={10} className="text-lime-400/70" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Read Article CTA Footer */}
                <div className="mt-6 pt-4 border-t border-[#1a2316] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    BY {post.author.name.toUpperCase()}
                  </span>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-lime-400 hover:text-lime-300 group-hover:translate-x-1 transition-all"
                  >
                    <span>READ LOG</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#232f1e] bg-[#0a0d09]/80 p-12 text-center space-y-4">
            <p className="font-mono text-slate-400 text-sm">
              NO LOGS MATCHED SEARCH CRITERIA: "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
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
