import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodayGratitude } from './use-today-gratitude';
import type { GratitudeEntry } from '@/shared/types/table';

// Unit test: hook orchestration over the gratitude service (mocked; the service
// is covered by gratitude-service.test.ts).
vi.mock('../services/gratitude-service', () => ({
  getTodayGratitude: vi.fn(),
  saveGratitude: vi.fn(),
}));

import { getTodayGratitude, saveGratitude } from '../services/gratitude-service';

const entry: GratitudeEntry = {
  id: 1,
  date: '2025-06-15',
  entry: 'Grateful for rest',
  updatedAt: 1_000,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getTodayGratitude).mockResolvedValue(undefined);
  vi.mocked(saveGratitude).mockResolvedValue(entry);
});

describe('useTodayGratitude', () => {
  it('should load today’s gratitude entry on mount', async () => {
    vi.mocked(getTodayGratitude).mockResolvedValue(entry);
    const { result } = renderHook(() => useTodayGratitude());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toEqual(entry);
  });

  it('should normalise a missing entry to null', async () => {
    const { result } = renderHook(() => useTodayGratitude());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toBeNull();
  });

  it('should save the entry and reflect the returned value', async () => {
    const { result } = renderHook(() => useTodayGratitude());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.save('Grateful for rest');
    });

    expect(saveGratitude).toHaveBeenCalledWith('Grateful for rest');
    expect(result.current.entry).toEqual(entry);
  });

  it('should still clear the loading flag when the initial fetch rejects', async () => {
    vi.mocked(getTodayGratitude).mockRejectedValue(new Error('IndexedDB unavailable'));
    const { result } = renderHook(() => useTodayGratitude());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry).toBeNull();
  });

  it('should propagate a save failure and leave the existing entry unchanged', async () => {
    vi.mocked(getTodayGratitude).mockResolvedValue(entry);
    const { result } = renderHook(() => useTodayGratitude());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(saveGratitude).mockRejectedValue(new Error('write failed'));
    await expect(result.current.save('New thanks')).rejects.toThrow('write failed');

    // The optimistic state should not advance past the last good value.
    expect(result.current.entry).toEqual(entry);
  });
});
