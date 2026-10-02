import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { db } from '@/shared/storage/app-db';
import { usePrayers } from './use-prayers';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

async function renderLoaded() {
  const hook = renderHook(() => usePrayers());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('usePrayers', () => {
  it('should load stored prayers newest first and clear the loading flag', async () => {
    await db.prayers.bulkAdd([
      { text: 'Older', answered: false, createdAt: 1, answeredAt: null },
      { text: 'Newer', answered: false, createdAt: 2, answeredAt: null },
    ] as never[]);
    const { result } = renderHook(() => usePrayers());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.prayers.map((p) => p.text)).toEqual(['Newer', 'Older']);
  });

  it('should expose an empty list when nothing is stored', async () => {
    const { result } = await renderLoaded();
    expect(result.current.prayers).toEqual([]);
  });

  it('should show an added prayer without a manual re-read', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.addPrayer('Healing for a friend');
    });

    await waitFor(() => expect(result.current.prayers.map((p) => p.text)).toEqual(['Healing for a friend']));
  });

  it('should mark a prayer answered', async () => {
    const id = (await db.prayers.add({ text: 'Peace', answered: false, createdAt: 1, answeredAt: null } as never)) as number;
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.toggleAnswered(id);
    });

    await waitFor(() => expect(result.current.prayers[0]?.answered).toBe(true));
  });

  it('should remove a prayer', async () => {
    const id = (await db.prayers.add({ text: 'Peace', answered: false, createdAt: 1, answeredAt: null } as never)) as number;
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.removePrayer(id);
    });

    await waitFor(() => expect(result.current.prayers).toEqual([]));
  });
});
