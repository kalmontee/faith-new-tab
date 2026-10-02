import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { db } from '@/shared/storage/app-db';
import { getTodayKey } from '@/shared/utils/date';
import { useTodayGratitude } from './use-today-gratitude';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

async function renderLoaded() {
  const hook = renderHook(() => useTodayGratitude());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('useTodayGratitude', () => {
  it('should load today’s stored gratitude entry', async () => {
    await db.gratitude.add({ date: getTodayKey(), entry: 'Rest', updatedAt: 1 } as never);
    const { result } = renderHook(() => useTodayGratitude());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry?.entry).toBe('Rest');
  });

  it('should normalise a missing entry to null', async () => {
    const { result } = await renderLoaded();
    expect(result.current.entry).toBeNull();
  });

  it('should reflect a saved entry without a manual re-read', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.save('Grateful for rest');
    });

    expect(result.current.entry?.entry).toBe('Grateful for rest');
    await waitFor(() => expect(result.current.entry?.entry).toBe('Grateful for rest'));
  });
});
