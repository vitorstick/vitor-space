import { useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HeaderHUD } from './components/HeaderHUD';
import { TimelinePage } from './pages/TimelinePage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { timeline } from './data/timeline';
import type { TimelineType } from './models/TimelineItem';

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
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
