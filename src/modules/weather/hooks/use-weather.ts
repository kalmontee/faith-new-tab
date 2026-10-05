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

const MANUAL_GEO_STATE: GeoState = { coords: null, error: null, loading: false };

function useGeolocation(enabled: boolean): GeoState {
  const [state, setState] = useState<GeoState>(initialGeoState);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return; // unsupported is already reflected in initial state

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
  }, [enabled]);

  return enabled ? state : MANUAL_GEO_STATE;
}

export function useWeather(): UseWeatherResult {
  const manualLocation = useSettingsStore((s) => s.manualLocation);
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);
  const isHydrated = useSettingsStore.persist.hasHydrated ? useSettingsStore.persist.hasHydrated() : true;
  const geo = useGeolocation(!manualLocation && isHydrated);
  const coords = manualLocation ?? geo.coords;

  const query = useQuery<WeatherData>({
    queryKey: ['weather', coords?.lat, coords?.lng, temperatureUnit, manualLocation?.name],
    queryFn: () =>
      manualLocation
        ? getWeatherData(manualLocation.lat, manualLocation.lng, temperatureUnit, manualLocation.name)
        : getWeatherData(geo.coords!.lat, geo.coords!.lng, temperatureUnit),
    enabled: !!coords,
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: geo.loading || (!!coords && query.isLoading),
    isError: query.isError,
    geoError: geo.error,
    refetch: query.refetch,
  };
}
