import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useCurrentVerseStore } from '@/shared/store/current-verse-store';
import { getDailyVerse } from '../services/verse-service';

export function useDailyVerse() {
  const setCurrentVerse = useCurrentVerseStore((s) => s.setCurrentVerse);

  const query = useQuery({
    queryKey: ['bible', 'daily-verse'],
    queryFn: getDailyVerse,
    retry: 2,
  });

  useEffect(() => {
    if (query.data) setCurrentVerse(query.data);
  }, [query.data, setCurrentVerse]);

  return query;
}
