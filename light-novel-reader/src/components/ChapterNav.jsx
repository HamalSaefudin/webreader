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
  const [selectedGroupLabel, setSelectedGroupLabel] = useState('all');
  const activeItemRef = useRef(null);
  const currentIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
  const currentChapter = currentIndex >= 0 ? chapters[currentIndex] : null;
  const lastChapterId = chapters.length ? chapters[chapters.length - 1].id : 0;

  const GROUP_SIZE = 200;
  const chapterIds = chapters.map(ch => ch.id);
  const minId = chapterIds.length > 0 ? Math.min(...chapterIds) : 0;
  const maxId = chapterIds.length > 0 ? Math.max(...chapterIds) : 0;

  const groups = [];
  if (chapters.length > 0) {
    for (let i = minId; i <= maxId; i += GROUP_SIZE) {
      const start = i;
      const end = Math.min(i + GROUP_SIZE - 1, maxId);
      groups.push({ start, end, label: `${start}-${end}` });
    }
  }

  const selectedGroup = groups.find(g => g.label === selectedGroupLabel) || null;
  const filteredChapters = !selectedGroup
    ? chapters
    : chapters.filter((ch) => ch.id >= selectedGroup.start && ch.id <= selectedGroup.end);

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

        {groups.length > 0 && (
          <div className="group-filter">
            <select
              value={selectedGroupLabel}
              onChange={(e) => setSelectedGroupLabel(e.target.value)}
              className="group-select"
            >
              <option value="all">All Chapters</option>
              {groups.map((group) => (
                <option key={group.label} value={group.label}>
                  {group.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="chapter-list">
          {filteredChapters.map((ch) => (
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
