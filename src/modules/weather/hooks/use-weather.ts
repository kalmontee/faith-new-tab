import { useState, useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '@/shared/store/settings-store';
import { getWeatherData } from '../services/weather-service';
import type { WeatherData } from '../types';

interface GeoState {
  coords: { lat: number; lng: number } | null;
  error: string | null;
  loading: boolean;
}

interface UseWeatherResult {
  data: WeatherData | undefined;
  isLoading: boolean;
  isError: boolean;
  geoError: string | null;
  refetch: () => void;
}

function initialGeoState(): GeoState {
  // Detect support synchronously so the initial render is already correct
  if (typeof navigator !== 'undefined' && !navigator.geolocation) {
    return { coords: null, error: 'Geolocation is not supported by your browser.', loading: false };
  }

  return { coords: null, error: null, loading: true };
}

function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>(initialGeoState);

  useEffect(() => {
    if (!navigator.geolocation) return; // already reflected in initial state

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setState({ coords: { lat: latitude, lng: longitude }, error: null, loading: false });
      },
      () => {
        setState({
          coords: null,
          error: 'Location access denied. Enable location to see weather.',
          loading: false,
        });
      },
      { timeout: 10_000 }
    );
  }, []);

  return state;
}

export function useWeather(): UseWeatherResult {
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);

  const query = useQuery<WeatherData>({
    queryKey: ['weather', coords?.lat, coords?.lng, temperatureUnit],
    queryFn: () => getWeatherData(coords!.lat, coords!.lng, temperatureUnit),
    enabled: !!coords,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: geoLoading || (!!coords && query.isLoading),
    isError: query.isError,
    geoError,
    refetch: query.refetch,
  };
}
