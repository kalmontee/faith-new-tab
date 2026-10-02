import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { db } from '@/shared/storage/app-db';
import { useLiveCollection } from './use-live-collection';

const readPrayers = () => db.prayers.toArray();

const prayer = { text: 'Healing', answered: false, createdAt: 1, answeredAt: null };

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('useLiveCollection', () => {
  it('should start loading and then expose the query result', async () => {
    await db.prayers.add(prayer as never);
    const { result } = renderHook(() => useLiveCollection(readPrayers));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(1);
  });

  it('should re-emit when the table changes after mount', async () => {
    const { result } = renderHook(() => useLiveCollection(readPrayers));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);

    await act(async () => {
      await db.prayers.add(prayer as never);
    });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
  });

  it('should stop loading and leave data undefined when the query fails', async () => {
    const failing = () => Promise.reject(new Error('boom'));
    const { result } = renderHook(() => useLiveCollection(failing));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
  });

  it('should resubscribe after a failed query and recover once it succeeds', async () => {
    let calls = 0;
    const flaky = () => (++calls === 1 ? Promise.reject(new Error('blocked')) : db.prayers.toArray());
    const { result } = renderHook(() => useLiveCollection(flaky));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();

    await waitFor(() => expect(result.current.data).toEqual([]), { timeout: 3_000 });
  });

  it('should stop observing after unmount', async () => {
    let runs = 0;
    const counting = () => {
      runs += 1;
      return db.prayers.toArray();
    };
    const { result, unmount } = renderHook(() => useLiveCollection(counting));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();
    const runsAtUnmount = runs;
    await db.prayers.add(prayer as never);
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(runs).toBe(runsAtUnmount);
  });
});
