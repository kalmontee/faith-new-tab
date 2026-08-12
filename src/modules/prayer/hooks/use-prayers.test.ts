import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePrayers } from './use-prayers';
import type { PrayerRequest } from '@/shared/types/table';

// Unit test: hook orchestration over the prayer service (mocked; the service is
// covered by prayer-service.test.ts).
vi.mock('../services/prayer-service', () => ({
  getAllPrayers: vi.fn(),
  addPrayer: vi.fn(),
  toggleAnswered: vi.fn(),
  removePrayer: vi.fn(),
}));

import { getAllPrayers, addPrayer, toggleAnswered, removePrayer } from '../services/prayer-service';

const prayer: PrayerRequest = {
  id: 1,
  text: 'Healing for a friend',
  answered: false,
  createdAt: 1_000,
  answeredAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAllPrayers).mockResolvedValue([]);
  vi.mocked(addPrayer).mockResolvedValue(prayer);
  vi.mocked(toggleAnswered).mockResolvedValue();
  vi.mocked(removePrayer).mockResolvedValue();
});

describe('usePrayers', () => {
  it('should load prayers on mount and clear the loading flag', async () => {
    vi.mocked(getAllPrayers).mockResolvedValue([prayer]);
    const { result } = renderHook(() => usePrayers());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.prayers).toEqual([prayer]);
  });

  it('should add a prayer and re-read the list', async () => {
    const { result } = renderHook(() => usePrayers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(getAllPrayers).mockResolvedValue([prayer]);
    await act(async () => {
      await result.current.addPrayer('Healing for a friend');
    });

    expect(addPrayer).toHaveBeenCalledWith('Healing for a friend');
    expect(result.current.prayers).toEqual([prayer]);
  });

  it('should mark a prayer answered and re-read the list', async () => {
    vi.mocked(getAllPrayers).mockResolvedValue([prayer]);
    const { result } = renderHook(() => usePrayers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(getAllPrayers).mockResolvedValue([{ ...prayer, answered: true, answeredAt: 2_000 }]);
    await act(async () => {
      await result.current.toggleAnswered(1);
    });

    expect(toggleAnswered).toHaveBeenCalledWith(1);
    expect(result.current.prayers[0]?.answered).toBe(true);
  });

  it('should remove a prayer and re-read the list', async () => {
    vi.mocked(getAllPrayers).mockResolvedValue([prayer]);
    const { result } = renderHook(() => usePrayers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(getAllPrayers).mockResolvedValue([]);
    await act(async () => {
      await result.current.removePrayer(1);
    });

    expect(removePrayer).toHaveBeenCalledWith(1);
    expect(result.current.prayers).toEqual([]);
  });

  it('should still clear the loading flag when the initial fetch rejects', async () => {
    vi.mocked(getAllPrayers).mockRejectedValue(new Error('IndexedDB unavailable'));
    const { result } = renderHook(() => usePrayers());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.prayers).toEqual([]);
  });

  it('should propagate an add failure and leave the list unchanged', async () => {
    vi.mocked(getAllPrayers).mockResolvedValue([prayer]);
    const { result } = renderHook(() => usePrayers());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(addPrayer).mockRejectedValue(new Error('write failed'));
    await expect(result.current.addPrayer('New request')).rejects.toThrow('write failed');

    expect(result.current.prayers).toEqual([prayer]);
  });
});
