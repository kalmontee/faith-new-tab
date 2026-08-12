import { useState, useEffect, useCallback } from 'react';
import { getTodayGratitude, saveGratitude } from '../services/gratitude-service';
import type { GratitudeEntry } from '@/shared/types/table';

export interface UseTodayGratitudeResult {
  entry: GratitudeEntry | null;
  isLoading: boolean;
  save: (entry: string) => Promise<void>;
}

export function useTodayGratitude(): UseTodayGratitudeResult {
  const [entry, setEntry] = useState<GratitudeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTodayGratitude()
      .then((e) => setEntry(e ?? null))
      .catch(() => setEntry(null))
      .finally(() => setIsLoading(false));
  }, []);

  const save = useCallback(async (text: string) => {
    const saved = await saveGratitude(text);
    setEntry(saved);
  }, []);

  return { entry, isLoading, save };
}
