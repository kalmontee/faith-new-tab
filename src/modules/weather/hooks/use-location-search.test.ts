import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLocationSearch } from './use-location-search';
import { createQueryWrapper } from '@/test/test-utils';

vi.mock('../services/location-search-service', async (importActual) => ({
  ...(await importActual<typeof import('../services/location-search-service')>()),
  findLocations: vi.fn(),
}));

import { findLocations } from '../services/location-search-service';

const LAGOS = { name: 'Lagos', label: 'Lagos, Nigeria', lat: 6.45, lng: 3.4 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(findLocations).mockResolvedValue([LAGOS]);
});

describe('useLocationSearch', () => {
  it('should stay idle without calling the service for a short query', async () => {
    const { result } = renderHook(() => useLocationSearch('L'), { wrapper: createQueryWrapper() });

    expect(result.current).toEqual({ state: 'idle', results: [] });
    await new Promise((resolve) => setTimeout(resolve, 350));
    expect(findLocations).not.toHaveBeenCalled();
  });

  it('should wait for the debounce, then return results', async () => {
    const { result, rerender } = renderHook(({ query }) => useLocationSearch(query), {
      wrapper: createQueryWrapper(),
      initialProps: { query: '' },
    });

    rerender({ query: 'Lagos' });

    expect(result.current.state).toBe('searching');
    expect(findLocations).not.toHaveBeenCalled();

    await waitFor(() => expect(result.current).toEqual({ state: 'ready', results: [LAGOS] }));
    expect(findLocations).toHaveBeenCalledWith('Lagos');
  });

  it('should report an error state when the search fails', async () => {
    vi.mocked(findLocations).mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useLocationSearch('Lagos'), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.state).toBe('error'), { timeout: 2000 });
    expect(result.current.results).toEqual([]);
  });
});
