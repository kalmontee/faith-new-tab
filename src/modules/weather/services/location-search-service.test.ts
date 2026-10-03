import { describe, it, expect, vi, beforeEach } from 'vitest';
import { findLocations } from './location-search-service';

vi.mock('../api/geocoding-api', () => ({
  searchLocations: vi.fn(),
}));

import { searchLocations } from '../api/geocoding-api';

const LAGOS = { name: 'Lagos', label: 'Lagos, Nigeria', lat: 6.45, lng: 3.4 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(searchLocations).mockResolvedValue([LAGOS]);
});

describe('findLocations', () => {
  it('should search with the trimmed query', async () => {
    expect(await findLocations('  Lagos  ')).toEqual([LAGOS]);
    expect(searchLocations).toHaveBeenCalledWith('Lagos');
  });

  it.each(['', ' ', 'L', ' L '])('should not call the API for the too-short query %j', async (query) => {
    expect(await findLocations(query)).toEqual([]);
    expect(searchLocations).not.toHaveBeenCalled();
  });
});
