import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentVerseStore } from '@/shared/store/current-verse-store';
import { getDailyVerse, getNewVerse } from '../services/verse-service';

const DAILY_VERSE_KEY = ['bible', 'daily-verse'] as const;

export function useDailyVerse() {
  const queryClient = useQueryClient();
  const setCurrentVerse = useCurrentVerseStore((s) => s.setCurrentVerse);

  const query = useQuery({
    queryKey: DAILY_VERSE_KEY,
    queryFn: () => getDailyVerse(),
    staleTime: 24 * 60 * 60 * 1000,
    retry: 2,
  });

  useEffect(() => {
    if (query.data) setCurrentVerse(query.data);
  }, [query.data, setCurrentVerse]);

  const refresh = useCallback(async () => {
    const currentRef = query.data?.reference;
    const newVerse = await getNewVerse(currentRef);
    queryClient.setQueryData(DAILY_VERSE_KEY, newVerse);
  }, [query.data?.reference, queryClient]);

  return { ...query, refresh };
}
