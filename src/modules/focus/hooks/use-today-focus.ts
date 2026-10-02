import { getTodayFocus, saveFocus } from '../services/focus-service';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
import type { FocusEntry } from '@/shared/types/table';

export interface UseTodayFocusResult {
  entry: FocusEntry | null;
  isLoading: boolean;
  save: (focus: string, tagline: string) => Promise<void>;
}

export function useTodayFocus(): UseTodayFocusResult {
  const { data, isLoading } = useLiveCollection(getTodayFocus);

  return {
    entry: data ?? null,
    isLoading,
    save: async (focus, tagline) => {
      await saveFocus(focus, tagline);
    },
  };
}
