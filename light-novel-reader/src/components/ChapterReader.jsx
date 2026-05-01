import React from 'react';
import DOMPurify from 'dompurify';
import { useChapter } from '../hooks/useChapter';
import '../styles/reader.css';

export function ChapterReader({ chapterId, fallbackTitle }) {
  const { chapter, loading, error } = useChapter(chapterId);

  if (chapterId == null) {
    return <div className="chapter-empty">Select a chapter to read</div>;
  }

  if (error) {
    return (
      <div className="chapter-empty">
        Failed to load chapter {chapterId}. {error.message}
      </div>
    );
  }

  if (!chapter && loading) {
    return <div className="chapter-empty">Loading chapter {chapterId}…</div>;
  }

  if (!chapter) {
    return <div className="chapter-empty">Chapter {chapterId} unavailable.</div>;
  }

  const sanitizedHTML = DOMPurify.sanitize(chapter.content);

  return (
    <article className="chapter-reader">
      <header className="chapter-header">
        <h1>{chapter.title || fallbackTitle}</h1>
        <span className="chapter-id">Chapter {chapter.id}</span>
      </header>
      <div
        className="chapter-content"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    </article>
  );
}
