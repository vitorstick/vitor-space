import { useMemo, useState, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HeaderHUD } from './components/HeaderHUD';
import { TimelinePage } from './pages/TimelinePage';
import { timeline } from './data/timeline';
import type { TimelineType } from './models/TimelineItem';

const BlogListPage = lazy(() => import('./pages/BlogListPage').then((m) => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const AskAIPage = lazy(() => import('./pages/AskAIPage').then((m) => ({ default: m.AskAIPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeFilter, setActiveFilter] = useState<'all' | TimelineType>('all');

  const filteredTimeline = useMemo(() => {
    if (activeFilter === 'all') return timeline;
    return timeline.filter((item) => item.type === activeFilter);
  }, [activeFilter]);

  const reachedItemsCount = useMemo(() => {
    return filteredTimeline.filter((item) => scrollProgress >= item.routeProgressPercentage).length;
  }, [filteredTimeline, scrollProgress]);

  return (
    <>
      <HeaderHUD
        scrollProgress={scrollProgress}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        totalItems={filteredTimeline.length}
        reachedItems={reachedItemsCount}
      />

      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center bg-[#060a11] text-lime-400 font-mono text-xs tracking-wider">
            INITIALIZING TELEMETRY...
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <TimelinePage
                scrollProgress={scrollProgress}
                setScrollProgress={setScrollProgress}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            }
          />
          <Route
            path="/waypoint/:waypointId"
            element={
              <TimelinePage
                scrollProgress={scrollProgress}
                setScrollProgress={setScrollProgress}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
              />
            }
          />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/ask-ai" element={<AskAIPage />} />
          <Route path="/chat" element={<AskAIPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
