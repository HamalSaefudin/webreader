import { useState, useEffect } from 'react';

// Loads the lightweight chapter manifest (id, title, slug, postedAt for all chapters).
export function useChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}chapters/index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load index.json: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setChapters(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { chapters, loading, error };
}
