import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import type { ManualLocation } from '@/shared/types/location';
import { findLocations, MIN_QUERY_LENGTH } from '../services/location-search-service';

const SEARCH_DEBOUNCE_MS = 300;

export type LocationSearch =
  | { state: 'idle'; results: [] }
  | { state: 'searching'; results: [] }
  | { state: 'error'; results: [] }
  | { state: 'ready'; results: ManualLocation[] };

export function useLocationSearch(query: string): LocationSearch {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS);
  const isSearchable = trimmed.length >= MIN_QUERY_LENGTH;

  const { data, isError } = useQuery({
    queryKey: ['location-search', debounced],
    queryFn: () => findLocations(debounced),
    enabled: debounced.length >= MIN_QUERY_LENGTH,
    staleTime: 5 * 60_000,
    retry: 1,
  });

  if (!isSearchable) return { state: 'idle', results: [] };
  if (debounced !== trimmed) return { state: 'searching', results: [] };
  if (isError) return { state: 'error', results: [] };
  if (!data) return { state: 'searching', results: [] };

  return { state: 'ready', results: data };
}
