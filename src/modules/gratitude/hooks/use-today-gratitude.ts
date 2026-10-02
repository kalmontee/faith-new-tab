import { getTodayGratitude, saveGratitude } from '../services/gratitude-service';
import { useOptimisticOverride } from '@/shared/hooks/use-optimistic-override';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
import type { GratitudeEntry } from '@/shared/types/table';

export interface UseTodayGratitudeResult {
  entry: GratitudeEntry | null;
  isLoading: boolean;
  save: (entry: string) => Promise<void>;
}

export function useTodayGratitude(): UseTodayGratitudeResult {
  const { data, isLoading } = useLiveCollection(getTodayGratitude);
  const [entry, setSaved] = useOptimisticOverride(data);

  return {
    entry: entry ?? null,
    isLoading,
    save: async (text) => {
      setSaved(await saveGratitude(text));
    },
  };
}
