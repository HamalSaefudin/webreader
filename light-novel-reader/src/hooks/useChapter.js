import { useState, useEffect } from 'react';

const memCache = new Map();
const LS_PREFIX = 'ch:';

function readFromLocalStorage(id) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + id);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeToLocalStorage(id, chapter) {
  try {
    localStorage.setItem(LS_PREFIX + id, JSON.stringify(chapter));
  } catch {
    // Quota exceeded — drop oldest cached chapters.
    pruneLocalStorage();
    try {
      localStorage.setItem(LS_PREFIX + id, JSON.stringify(chapter));
    } catch {
      // Give up silently; chapter will just be re-fetched next time.
    }
  }
}

function pruneLocalStorage() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LS_PREFIX)) keys.push(k);
  }
  // Drop half of them (FIFO-ish).
  keys.slice(0, Math.ceil(keys.length / 2)).forEach((k) => localStorage.removeItem(k));
}

// Fetches a single chapter on demand. Caches in memory + localStorage so
// re-visits and offline reads are instant.
export function useChapter(id) {
  const [chapter, setChapter] = useState(() => {
    if (id == null) return null;
    if (memCache.has(id)) return memCache.get(id);
    const ls = readFromLocalStorage(id);
    if (ls) memCache.set(id, ls);
    return ls;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id == null) {
      setChapter(null);
      return;
    }
    if (memCache.has(id)) {
      setChapter(memCache.get(id));
      return;
    }
    const ls = readFromLocalStorage(id);
    if (ls) {
      memCache.set(id, ls);
      setChapter(ls);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${import.meta.env.BASE_URL}chapters/${id}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Chapter ${id} not found (${r.status})`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        memCache.set(id, data);
        writeToLocalStorage(id, data);
        setChapter(data);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { chapter, loading, error };
}
