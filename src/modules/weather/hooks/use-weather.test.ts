import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeather } from './use-weather';
import { createQueryWrapper } from '@/test/test-utils';
import type { WeatherData } from '../types';

vi.mock('../services/weather-service', () => ({
  getWeatherData: vi.fn(),
}));

import { getWeatherData } from '../services/weather-service';

const weather: WeatherData = {
  temperature: 72,
  high: 80,
  low: 65,
  conditionCode: 0,
  conditionText: 'Clear Sky',
  city: 'New York',
  unit: 'fahrenheit',
};

const COORDS = { latitude: 40.7, longitude: -74.0 };
const originalGeolocationDescriptor = Object.getOwnPropertyDescriptor(navigator, 'geolocation');

// Install a geolocation whose behaviour each test configures.
function stubGeolocation(impl: (success: PositionCallback, error: PositionErrorCallback) => void) {
  Object.defineProperty(navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn(impl) },
    configurable: true,
  });
}

function grantGeolocation() {
  stubGeolocation((success) => {
    success({ coords: COORDS } as GeolocationPosition);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getWeatherData).mockResolvedValue(weather);
});

afterEach(() => {
  if (originalGeolocationDescriptor) {
    Object.defineProperty(navigator, 'geolocation', originalGeolocationDescriptor);
  } else {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });
  }
});

describe('useWeather', () => {
  it('should fetch weather for the resolved coordinates', async () => {
    grantGeolocation();
    const { result } = renderHook(() => useWeather(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.data).toEqual(weather));
    expect(getWeatherData).toHaveBeenCalledWith(COORDS.latitude, COORDS.longitude, 'fahrenheit');
  });

  it('should report a geo error and never call the weather service when permission is denied', async () => {
    stubGeolocation((_success, error) => {
      error({ code: 1, message: 'denied' } as GeolocationPositionError);
    });

    const { result } = renderHook(() => useWeather(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.geoError).toMatch(/location access denied/i));
    expect(result.current.isLoading).toBe(false);
    expect(getWeatherData).not.toHaveBeenCalled();
  });

  it('should report a geo error when geolocation is unsupported', async () => {
    Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true });

    const { result } = renderHook(() => useWeather(), { wrapper: createQueryWrapper() });

    expect(result.current.geoError).toMatch(/not supported/i);
    expect(result.current.isLoading).toBe(false);
    expect(getWeatherData).not.toHaveBeenCalled();
  });

  it('should surface an error state when the weather service fails', async () => {
    grantGeolocation();
    vi.mocked(getWeatherData).mockRejectedValue(new Error('API down'));

    const { result } = renderHook(() => useWeather(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
