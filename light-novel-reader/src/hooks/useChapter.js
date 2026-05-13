import { useState, useEffect } from 'react';
import { supabase, SERIES_ID } from '../lib/supabase';

export function useChapter(id) {
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id == null) {
      setChapter(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchChapter = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('id, title, content')
          .eq('series_id', SERIES_ID)
          .eq('id', id)
          .single();

        if (cancelled) return;

        if (error) throw error;
        if (!data) throw new Error(`Chapter ${id} not found`);

        setChapter({
          id: data.id,
          title: data.title,
          content: data.content
        });
      } catch (err) {
        if (cancelled) return;
        setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchChapter();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { chapter, loading, error };
}
