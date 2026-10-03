import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchLocations } from './geocoding-api';

function stubResponse(body: unknown, ok = true, status = 200) {
  vi.mocked(fetch).mockResolvedValue({ ok, status, json: async () => body } as Response);
}

const LAGOS = { id: 1, name: 'Lagos', admin1: 'Lagos', country: 'Nigeria', latitude: 6.45, longitude: 3.4 };

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('searchLocations', () => {
  it('should map results to manual locations with a readable label', async () => {
    stubResponse({ results: [LAGOS] });

    expect(await searchLocations('Lagos')).toEqual([{ name: 'Lagos', label: 'Lagos, Nigeria', lat: 6.45, lng: 3.4 }]);
  });

  it('should keep region and country in the label when they differ from the name', async () => {
    stubResponse({ results: [{ ...LAGOS, name: 'Springfield', admin1: 'Illinois', country: 'United States' }] });

    const [result] = await searchLocations('Springfield');

    expect(result?.label).toBe('Springfield, Illinois, United States');
  });

  it('should omit missing label parts', async () => {
    stubResponse({ results: [{ id: 2, name: 'Atlantis', latitude: 1, longitude: 2 }] });

    const [result] = await searchLocations('Atlantis');

    expect(result?.label).toBe('Atlantis');
  });

  it('should return an empty list when the API finds nothing', async () => {
    stubResponse({ generationtime_ms: 0.3 });

    expect(await searchLocations('zzzzzz')).toEqual([]);
  });

  it('should send the encoded query and a result limit', async () => {
    stubResponse({});

    await searchLocations('São Paulo');

    const url = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(url).toContain('name=S%C3%A3o%20Paulo');
    expect(url).toContain('count=5');
  });

  it('should throw when the API responds with an error status', async () => {
    stubResponse({}, false, 503);

    await expect(searchLocations('Lagos')).rejects.toThrow('Geocoding error: 503');
  });

  it('should throw when the response shape is invalid', async () => {
    stubResponse({ results: [{ name: 'Lagos' }] });

    await expect(searchLocations('Lagos')).rejects.toThrow();
  });
});
