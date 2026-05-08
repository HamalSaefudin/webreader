import React, { useState, useRef, useEffect } from 'react';
import '../styles/nav.css';

export function ChapterNav({
  chapters,
  currentChapterId,
  onChapterSelect,
  onNext,
  onPrev,
  onScrollToTop,
  uiVisible,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeItemRef = useRef(null);
  const currentIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
  const currentChapter = currentIndex >= 0 ? chapters[currentIndex] : null;
  const lastChapterId = chapters.length ? chapters[chapters.length - 1].id : 0;

  useEffect(() => {
    if (sidebarOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [sidebarOpen]);

  const handleChapterSelect = (chapterId) => {
    onChapterSelect(chapterId);
    setSidebarOpen(false);
  };

  return (
    <>
      <header className={`app-header ${uiVisible ? 'visible' : ''}`}>
        <div className="header-titles">
          <h1>Mount Hua Sect</h1>
          <p className="subtitle">A Light Novel Reader</p>
        </div>
      </header>

      <button
        className={`sidebar-toggle ${sidebarOpen ? 'hidden' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setSidebarOpen(true);
        }}
        title="Open chapter list"
      >
        ☰
      </button>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`chapter-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Chapters</h2>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="chapter-list">
          {chapters.map((ch) => (
            <button
              key={ch.id}
              ref={ch.id === currentChapterId ? activeItemRef : null}
              className={`chapter-item ${ch.id === currentChapterId ? 'active' : ''}`}
              onClick={() => handleChapterSelect(ch.id)}
            >
              <span className="chapter-number">Ch. {ch.id}</span>
              <span className="chapter-name">{ch.title}</span>
            </button>
          ))}
        </div>
      </aside>

      <nav className={`chapter-nav ${uiVisible ? 'visible' : ''}`}>
        <button
          className="nav-button nav-prev"
          onClick={onPrev}
          disabled={currentIndex <= 0}
          title="Previous chapter"
        >
          ← Prev
        </button>

        {currentChapter && (
          <div className="nav-info">
            <span className="chapter-counter">
              Ch. {currentChapter.id} / {lastChapterId}
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentIndex + 1) / chapters.length) * 100}%` }}
              />
            </div>
            <button
              className="scroll-top-button"
              onClick={onScrollToTop}
              title="Scroll to top"
            >
              ↑
            </button>
          </div>
        )}

        <button
          className="nav-button nav-next"
          onClick={onNext}
          disabled={currentIndex >= chapters.length - 1}
          title="Next chapter"
        >
          Next →
        </button>
      </nav>
    </>
  );
}
