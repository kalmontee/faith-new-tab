import type { ManualLocation } from '@/shared/types/location';
import { searchLocations } from '../api/geocoding-api';

export const MIN_QUERY_LENGTH = 2;

export async function findLocations(query: string): Promise<ManualLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) return [];

  return searchLocations(trimmed);
}
