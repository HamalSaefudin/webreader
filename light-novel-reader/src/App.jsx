import React from 'react';
import { useChapters } from './hooks/useChapters';
import { useBookmarks } from './hooks/useBookmarks';
import { useScrollMemory } from './hooks/useScrollMemory';
import { ChapterReader } from './components/ChapterReader';
import { ChapterNav } from './components/ChapterNav';

function App() {
  const { chapters, loading, error } = useChapters();
  const defaultId = chapters[0]?.id ?? 1;
  const { currentChapter, goToChapter } = useBookmarks(defaultId);
  const isInitialRenderRef = React.useRef(true);

  useScrollMemory(currentChapter);

  // If the saved bookmark points at a chapter we no longer have on disk
  // (e.g. someone bookmarked ch.11 before the manifest was trimmed),
  // snap to the nearest available chapter and persist the corrected value.
  React.useEffect(() => {
    if (!chapters.length) return;
    if (chapters.some((ch) => ch.id === currentChapter)) return;
    const nearest = chapters.reduce((best, ch) =>
      Math.abs(ch.id - currentChapter) < Math.abs(best.id - currentChapter) ? ch : best
    );
    goToChapter(nearest.id);
  }, [chapters, currentChapter, goToChapter]);

  if (loading) return <div className="loading">Loading novel…</div>;
  if (error) return <div className="error">Failed to load: {error.message}</div>;
  if (!chapters.length) return <div className="error">No chapters found</div>;

  // Resolve by index — chapter IDs are not contiguous (gap between ch.10 and ch.577).
  const found = chapters.findIndex((ch) => ch.id === currentChapter);
  const currentIndex = found >= 0 ? found : 0;
  const activeChapter = chapters[currentIndex];
  const activeId = activeChapter?.id ?? defaultId;

  const handleNext = () => {
    if (currentIndex < chapters.length - 1) goToChapter(chapters[currentIndex + 1].id);
  };
  const handlePrev = () => {
    if (currentIndex > 0) goToChapter(chapters[currentIndex - 1].id);
  };

  React.useEffect(() => {
    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      return;
    }
    const main = document.querySelector('.app-main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeId]);

  return (
    <div className="app">
      <ChapterNav
        chapters={chapters}
        currentChapterId={activeId}
        onChapterSelect={goToChapter}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      <main className="app-main">
        <ChapterReader chapterId={activeId} fallbackTitle={activeChapter?.title} />
        <footer className="app-footer">
          <p>Chapters cached locally as you read. Works offline after first visit.</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
