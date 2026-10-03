import type { ManualLocation } from '@/shared/types/location';
import { GeocodingSchema } from '../utils';

const GEOCODING_API_URL: string = import.meta.env.VITE_GEOCODING_API_URL;
const MAX_RESULTS = 5;

function toLabel(parts: (string | undefined)[]): string {
  return parts.filter((part, i): part is string => !!part && part !== parts[i - 1]).join(', ');
}

export async function searchLocations(query: string): Promise<ManualLocation[]> {
  const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=${MAX_RESULTS}&language=en&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Geocoding error: ${res.status}`);

  const { results = [] } = GeocodingSchema.parse(await res.json());

  return results.map(({ name, admin1, country, latitude, longitude }) => ({
    name,
    label: toLabel([name, admin1, country]),
    lat: latitude,
    lng: longitude,
  }));
}
