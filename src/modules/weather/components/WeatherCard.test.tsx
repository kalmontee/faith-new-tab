import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import WeatherCard from './WeatherCard';
import { useViewStore } from '@/shared/store/view-store';

vi.mock('../hooks/use-weather', () => ({
  useWeather: vi.fn(),
}));

import { useWeather } from '../hooks/use-weather';

beforeEach(() => {
  vi.clearAllMocks();
  useViewStore.setState({ view: 'dashboard' });
});

describe('WeatherCard', () => {
  it('should offer a way to choose a city in Settings when location is denied', () => {
    vi.mocked(useWeather).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      geoError: 'Location access denied. Enable location to see weather.',
      refetch: vi.fn(),
    });
    render(<WeatherCard />);

    fireEvent.click(screen.getByRole('button', { name: /choose a city/i }));

    expect(useViewStore.getState().view).toBe('settings');
  });

  it('should not offer the Settings shortcut when weather loaded', () => {
    vi.mocked(useWeather).mockReturnValue({
      data: { temperature: 72, high: 80, low: 65, conditionCode: 0, conditionText: 'Clear Sky', city: 'Lagos', unit: 'fahrenheit' },
      isLoading: false,
      isError: false,
      geoError: null,
      refetch: vi.fn(),
    });
    render(<WeatherCard />);

    expect(screen.queryByRole('button', { name: /choose a city/i })).toBeNull();
  });
});
