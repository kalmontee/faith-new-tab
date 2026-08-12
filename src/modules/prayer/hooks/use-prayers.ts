import { useState, useEffect, useCallback } from 'react';
import {
  getAllPrayers,
  addPrayer as addPrayerToStore,
  toggleAnswered as toggleAnsweredInStore,
  removePrayer as removePrayerFromStore,
} from '../services/prayer-service';
import type { PrayerRequest } from '@/shared/types/table';

export interface UsePrayersResult {
  prayers: PrayerRequest[];
  isLoading: boolean;
  addPrayer: (text: string) => Promise<void>;
  toggleAnswered: (id: number) => Promise<void>;
  removePrayer: (id: number) => Promise<void>;
}

export function usePrayers(): UsePrayersResult {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllPrayers()
      .then(setPrayers)
      .catch(() => setPrayers([]))
      .finally(() => setIsLoading(false));
  }, []);

  const addPrayer = useCallback(async (text: string) => {
    await addPrayerToStore(text);
    setPrayers(await getAllPrayers());
  }, []);

  const toggleAnswered = useCallback(async (id: number) => {
    await toggleAnsweredInStore(id);
    setPrayers(await getAllPrayers());
  }, []);

  const removePrayer = useCallback(async (id: number) => {
    await removePrayerFromStore(id);
    setPrayers(await getAllPrayers());
  }, []);

  return { prayers, isLoading, addPrayer, toggleAnswered, removePrayer };
}
