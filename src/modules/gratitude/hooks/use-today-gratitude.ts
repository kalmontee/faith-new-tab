import { getTodayGratitude, saveGratitude } from '../services/gratitude-service';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
import type { GratitudeEntry } from '@/shared/types/table';

export interface UseTodayGratitudeResult {
  entry: GratitudeEntry | null;
  isLoading: boolean;
  save: (entry: string) => Promise<void>;
}

export function useTodayGratitude(): UseTodayGratitudeResult {
  const { data, isLoading } = useLiveCollection(getTodayGratitude);

  return {
    entry: data ?? null,
    isLoading,
    save: async (text) => {
      await saveGratitude(text);
    },
  };
}
