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
        const [{ data: meta, error: metaError }, { data: contentData, error: contentError }] = await Promise.all([
          supabase
            .from('chapters')
            .select('id, title')
            .eq('series_id', SERIES_ID)
            .eq('id', id)
            .single(),
          supabase
            .from('chapter_contents')
            .select('content')
            .eq('series_id', SERIES_ID)
            .eq('chapter_id', id)
            .single()
        ]);

        if (cancelled) return;

        if (metaError) throw metaError;
        if (!meta) throw new Error(`Chapter ${id} not found`);

        if (contentError) throw contentError;

        setChapter({
          id: meta.id,
          title: meta.title,
          content: contentData?.content || ''
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
