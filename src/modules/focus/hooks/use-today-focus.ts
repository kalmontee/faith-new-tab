import { useState, useEffect, useCallback } from 'react';
import { getTodayFocus, saveFocus } from '../services/focus-service';
import type { FocusEntry } from '@/shared/types/table';

export interface UseTodayFocusResult {
  entry: FocusEntry | null;
  isLoading: boolean;
  save: (focus: string, tagline: string) => Promise<void>;
}

export function useTodayFocus(): UseTodayFocusResult {
  const [entry, setEntry] = useState<FocusEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTodayFocus()
      .then((e) => setEntry(e ?? null))
      .catch(() => setEntry(null))
      .finally(() => setIsLoading(false));
  }, []);

  const save = useCallback(async (focus: string, tagline: string) => {
    const saved = await saveFocus(focus, tagline);
    setEntry(saved);
  }, []);

  return { entry, isLoading, save };
}
