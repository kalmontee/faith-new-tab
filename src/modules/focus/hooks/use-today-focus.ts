import { getTodayFocus, saveFocus } from '../services/focus-service';
import { useOptimisticOverride } from '@/shared/hooks/use-optimistic-override';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
import type { FocusEntry } from '@/shared/types/table';

export interface UseTodayFocusResult {
  entry: FocusEntry | null;
  isLoading: boolean;
  save: (focus: string, tagline: string) => Promise<void>;
}

export function useTodayFocus(): UseTodayFocusResult {
  const { data, isLoading } = useLiveCollection(getTodayFocus);
  const [entry, setSaved] = useOptimisticOverride(data);

  return {
    entry: entry ?? null,
    isLoading,
    save: async (focus, tagline) => {
      setSaved(await saveFocus(focus, tagline));
    },
  };
}
