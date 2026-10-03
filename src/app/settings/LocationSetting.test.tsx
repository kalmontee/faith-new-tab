import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { LocationSetting } from './LocationSetting';
import { useSettingsStore } from '@/shared/store/settings-store';
import type { ManualLocation } from '@/shared/types/location';

vi.mock('@/modules/weather', () => ({
  useLocationSearch: vi.fn(),
}));

import { useLocationSearch } from '@/modules/weather';

const LAGOS: ManualLocation = { name: 'Lagos', label: 'Lagos, Nigeria', lat: 6.45, lng: 3.4 };
const LAGOS_PORTUGAL: ManualLocation = { name: 'Lagos', label: 'Lagos, Faro, Portugal', lat: 37.1, lng: -8.67 };

// Mirrors the real hook: nothing to search until the query is long enough.
function mockSearch(search: ReturnType<typeof useLocationSearch>) {
  vi.mocked(useLocationSearch).mockImplementation((query) => (query.trim().length < 2 ? { state: 'idle', results: [] } : search));
}

function typeQuery(value: string) {
  fireEvent.change(screen.getByRole('combobox', { name: /location/i }), { target: { value } });
}

beforeEach(() => {
  vi.clearAllMocks();
  useSettingsStore.setState({ manualLocation: null });
  mockSearch({ state: 'idle', results: [] });
});

describe('LocationSetting', () => {
  it('should say the browser location is in use when no city is chosen', () => {
    render(<LocationSetting />);

    expect(screen.getByText(/using your browser/i)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /use my location/i })).toBeNull();
  });

  it('should list search results as options', () => {
    mockSearch({ state: 'ready', results: [LAGOS, LAGOS_PORTUGAL] });
    render(<LocationSetting />);
    typeQuery('Lagos');

    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Lagos, Nigeria', 'Lagos, Faro, Portugal']);
  });

  it('should save the clicked result and reset the search', () => {
    mockSearch({ state: 'ready', results: [LAGOS, LAGOS_PORTUGAL] });
    render(<LocationSetting />);
    typeQuery('Lagos');

    fireEvent.click(screen.getByRole('option', { name: 'Lagos, Faro, Portugal' }));

    expect(useSettingsStore.getState().manualLocation).toEqual(LAGOS_PORTUGAL);
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('should pick a result with the arrow keys and Enter', () => {
    mockSearch({ state: 'ready', results: [LAGOS, LAGOS_PORTUGAL] });
    render(<LocationSetting />);
    typeQuery('Lagos');
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(useSettingsStore.getState().manualLocation).toEqual(LAGOS_PORTUGAL);
  });

  it('should wrap the active option around at both ends', () => {
    mockSearch({ state: 'ready', results: [LAGOS, LAGOS_PORTUGAL] });
    render(<LocationSetting />);
    typeQuery('Lagos');
    const input = screen.getByRole('combobox');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[1]?.id);

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[0]?.id);
  });

  it('should not choose anything when Enter is pressed with no active option', () => {
    mockSearch({ state: 'ready', results: [LAGOS] });
    render(<LocationSetting />);
    typeQuery('Lagos');

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Enter' });

    expect(useSettingsStore.getState().manualLocation).toBeNull();
  });

  it('should close the results and clear the query on Escape', () => {
    mockSearch({ state: 'ready', results: [LAGOS] });
    render(<LocationSetting />);
    typeQuery('Lagos');

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });

    expect(screen.queryByRole('listbox')).toBeNull();
    expect((screen.getByRole('combobox') as HTMLInputElement).value).toBe('');
  });

  it.each([
    ['searching', /searching/i],
    ['error', /couldn.t search/i],
  ] as const)('should show a %s message', (state, message) => {
    mockSearch({ state, results: [] });
    render(<LocationSetting />);
    typeQuery('Lagos');

    expect(screen.getByRole('status').textContent).toMatch(message);
  });

  it('should tell the user when no city matches', () => {
    mockSearch({ state: 'ready', results: [] });
    render(<LocationSetting />);
    typeQuery('zzzz');

    expect(screen.getByRole('status').textContent).toMatch(/no cities found/i);
  });

  it('should show the chosen city and let the user go back to the browser location', () => {
    useSettingsStore.setState({ manualLocation: LAGOS });
    render(<LocationSetting />);

    expect(screen.getByText('Lagos, Nigeria')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /use my location/i }));

    expect(useSettingsStore.getState().manualLocation).toBeNull();
    expect(screen.getByText(/using your browser/i)).toBeTruthy();
  });
});
