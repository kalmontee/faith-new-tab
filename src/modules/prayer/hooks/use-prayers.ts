import {
  getAllPrayers,
  addPrayer as addPrayerToStore,
  toggleAnswered as toggleAnsweredInStore,
  removePrayer as removePrayerFromStore,
} from '../services/prayer-service';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
import type { PrayerRequest } from '@/shared/types/table';

export interface UsePrayersResult {
  prayers: PrayerRequest[];
  isLoading: boolean;
  addPrayer: (text: string) => Promise<void>;
  toggleAnswered: (id: number) => Promise<void>;
  removePrayer: (id: number) => Promise<void>;
}

export function usePrayers(): UsePrayersResult {
  const { data, isLoading } = useLiveCollection(getAllPrayers);

  return {
    prayers: data ?? [],
    isLoading,
    addPrayer: async (text) => {
      await addPrayerToStore(text);
    },
    toggleAnswered: toggleAnsweredInStore,
    removePrayer: removePrayerFromStore,
  };
}
