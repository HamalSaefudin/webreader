import { useState, useEffect } from 'react';
import { supabase, SERIES_ID } from '../lib/supabase';

export function useChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('id, title, slug, posted_at')
          .eq('series_id', SERIES_ID)
          .order('chapter_number', { ascending: true });

        if (error) throw error;

        const formatted = data.map((ch) => ({
          id: ch.id,
          title: ch.title,
          slug: ch.slug,
          postedAt: ch.posted_at
        }));

        setChapters(formatted);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  return { chapters, loading, error };
}
