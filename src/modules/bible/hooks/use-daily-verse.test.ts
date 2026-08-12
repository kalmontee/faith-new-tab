import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDailyVerse } from './use-daily-verse';
import { useCurrentVerseStore } from '@/shared/store/current-verse-store';
import { createQueryWrapper } from '@/test/test-utils';
import type { DailyVerse } from '../types';

vi.mock('../services/verse-service', () => ({
  getDailyVerse: vi.fn(),
  getNewVerse: vi.fn(),
}));

import { getDailyVerse, getNewVerse } from '../services/verse-service';

const verse: DailyVerse = {
  reference: 'John 3:16',
  text: 'For God so loved the world...',
  translation: 'NIV',
  fetchedAt: 1_000,
};

const newVerse: DailyVerse = {
  reference: 'Romans 8:28',
  text: 'And we know that in all things God works for the good...',
  translation: 'NIV',
  fetchedAt: 2_000,
};

beforeEach(() => {
  vi.clearAllMocks();
  useCurrentVerseStore.setState({ verse: null });
  vi.mocked(getDailyVerse).mockResolvedValue(verse);
  vi.mocked(getNewVerse).mockResolvedValue(newVerse);
});

describe('useDailyVerse', () => {
  it('should fetch the daily verse and expose it as query data', async () => {
    const { result } = renderHook(() => useDailyVerse(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(verse);
  });

  it('should mirror the fetched verse into the current-verse store', async () => {
    renderHook(() => useDailyVerse(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(useCurrentVerseStore.getState().verse).toEqual(verse));
  });

  it('should fetch a new verse on refresh, passing the current reference for de-duping', async () => {
    const { result } = renderHook(() => useDailyVerse(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await act(async () => {
      await result.current.refresh();
    });

    expect(getNewVerse).toHaveBeenCalledWith(verse.reference);
    await waitFor(() => expect(result.current.data).toEqual(newVerse));
  });

  it('should surface an error state when the fetch fails', async () => {
    vi.mocked(getDailyVerse).mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useDailyVerse(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });

  it('should propagate a refresh failure without corrupting the cached verse', async () => {
    const { result } = renderHook(() => useDailyVerse(), { wrapper: createQueryWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    vi.mocked(getNewVerse).mockRejectedValue(new Error('network down'));
    await expect(result.current.refresh()).rejects.toThrow('network down');

    expect(result.current.data).toEqual(verse);
  });
});
