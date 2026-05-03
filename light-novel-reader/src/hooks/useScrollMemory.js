import { useEffect, useRef } from 'react';

const STORAGE_KEY = 'webreader:scroll';
let isFirstRender = true;

export function useScrollMemory(chapterId) {
  const prevChapterRef = useRef(chapterId);

  // Save scroll position on scroll (debounced)
  useEffect(() => {
    const main = document.querySelector('.app-main');
    if (!main) return;

    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const positions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        positions[chapterId] = main.scrollTop;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      }, 300);
    };

    main.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timeoutId);
      main.removeEventListener('scroll', handleScroll);
    };
  }, [chapterId]);

  // Restore scroll on first render only, scroll to top on chapter change
  useEffect(() => {
    const main = document.querySelector('.app-main');
    if (!main) return;

    if (isFirstRender) {
      isFirstRender = false;
      // On initial page load: restore saved scroll position
      const positions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const savedScroll = positions[chapterId];
      if (savedScroll !== undefined && savedScroll > 0) {
        requestAnimationFrame(() => {
          main.scrollTop = savedScroll;
        });
      }
    } else if (prevChapterRef.current !== chapterId) {
      // On chapter change: scroll to top (will be done by scroll-to-top effect in App.jsx)
      // This effect doesn't need to do anything here, just track the change
      prevChapterRef.current = chapterId;
    }
  }, [chapterId]);
}
