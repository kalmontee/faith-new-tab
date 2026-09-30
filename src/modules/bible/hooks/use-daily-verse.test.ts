import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDailyVerse } from './use-daily-verse';
import { useCurrentVerseStore } from '@/shared/store/current-verse-store';
import { createQueryWrapper } from '@/test/test-utils';
import type { DailyVerse } from '../types';

vi.mock('../services/verse-service', () => ({
  getDailyVerse: vi.fn(),
}));

import { getDailyVerse } from '../services/verse-service';

const verse: DailyVerse = {
  reference: 'John 3:16',
  text: 'For God so loved the world...',
  translation: 'NIV',
  fetchedAt: 1_000,
};

beforeEach(() => {
  vi.clearAllMocks();
  useCurrentVerseStore.setState({ verse: null });
  vi.mocked(getDailyVerse).mockResolvedValue(verse);
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

  it('should surface an error state when the fetch fails', async () => {
    vi.mocked(getDailyVerse).mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useDailyVerse(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.data).toBeUndefined();
  });
});
