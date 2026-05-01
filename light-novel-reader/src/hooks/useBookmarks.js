import { useState, useEffect } from 'react';

export function useBookmarks(defaultId = 1) {
  const [currentChapter, setCurrentChapter] = useState(() => {
    const saved = localStorage.getItem('currentChapter');
    return saved ? parseInt(saved, 10) : defaultId;
  });

  useEffect(() => {
    localStorage.setItem('currentChapter', currentChapter);
  }, [currentChapter]);

  const goToChapter = (chapterId) => setCurrentChapter(chapterId);
  const nextChapter = (totalChapters) => {
    if (currentChapter < totalChapters) setCurrentChapter(currentChapter + 1);
  };
  const prevChapter = () => {
    if (currentChapter > 1) setCurrentChapter(currentChapter - 1);
  };

  return { currentChapter, goToChapter, nextChapter, prevChapter };
}
