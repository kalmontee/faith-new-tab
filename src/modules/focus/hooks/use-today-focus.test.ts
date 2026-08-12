import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodayFocus } from './use-today-focus';
import type { FocusEntry } from '@/shared/types/table';

vi.mock('../services/focus-service', () => ({
  getTodayFocus: vi.fn(),
  saveFocus: vi.fn(),
}));

import { getTodayFocus, saveFocus } from '../services/focus-service';

const entry: FocusEntry = {
  id: 1,
  date: '2025-06-15',
  focus: 'Trust the process',
  tagline: 'One step at a time',
  updatedAt: 1_000,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTodayFocus).mockResolvedValue(undefined);
  vi.mocked(saveFocus).mockResolvedValue(entry);
});

describe('useTodayFocus', () => {
  it('should load today’s focus entry on mount', async () => {
    vi.mocked(getTodayFocus).mockResolvedValue(entry);
    const { result } = renderHook(() => useTodayFocus());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toEqual(entry);
  });

  it('should normalise a missing entry to null (not undefined)', async () => {
    const { result } = renderHook(() => useTodayFocus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toBeNull();
  });

  it('should save the focus and reflect the returned entry without re-fetching', async () => {
    const { result } = renderHook(() => useTodayFocus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.save('Trust the process', 'One step at a time');
    });

    expect(saveFocus).toHaveBeenCalledWith('Trust the process', 'One step at a time');
    expect(result.current.entry).toEqual(entry);
    // save() updates state from its own return value; it must not re-read the store.
    expect(getTodayFocus).toHaveBeenCalledTimes(1);
  });

  it('should still clear the loading flag when the initial fetch rejects', async () => {
    vi.mocked(getTodayFocus).mockRejectedValue(new Error('IndexedDB unavailable'));
    const { result } = renderHook(() => useTodayFocus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toBeNull();
  });

  it('should propagate a save failure and leave the existing entry unchanged', async () => {
    vi.mocked(getTodayFocus).mockResolvedValue(entry);
    const { result } = renderHook(() => useTodayFocus());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(saveFocus).mockRejectedValue(new Error('write failed'));
    await expect(result.current.save('New focus', 'New tagline')).rejects.toThrow('write failed');

    expect(result.current.entry).toEqual(entry);
  });
});
