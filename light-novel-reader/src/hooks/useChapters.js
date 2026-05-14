import { useState, useEffect } from 'react';
import { supabase, SERIES_ID } from '../lib/supabase';

export function useChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        let allChapters = [];
        let from = 0;
        const pageSize = 2000;

        while (true) {
          const { data, error } = await supabase
            .from('chapters')
            .select('id, title, slug, posted_at')
            .eq('series_id', SERIES_ID)
            .order('chapter_number', { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          allChapters = [...allChapters, ...data];
          if (data.length < pageSize) break;
          from += pageSize;
        }

        const formatted = allChapters.map((ch) => ({
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
