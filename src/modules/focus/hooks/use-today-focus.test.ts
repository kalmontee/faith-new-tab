import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { db } from '@/shared/storage/app-db';
import { getTodayKey } from '@/shared/utils/date';
import { useTodayFocus } from './use-today-focus';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

async function renderLoaded() {
  const hook = renderHook(() => useTodayFocus());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

describe('useTodayFocus', () => {
  it('should load today’s stored focus entry', async () => {
    await db.focus.add({ date: getTodayKey(), focus: 'Trust', tagline: 'Step', updatedAt: 1 } as never);
    const { result } = renderHook(() => useTodayFocus());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entry?.focus).toBe('Trust');
  });

  it('should normalise a missing entry to null', async () => {
    const { result } = await renderLoaded();
    expect(result.current.entry).toBeNull();
  });

  it('should reflect a saved focus without a manual re-read', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.save('Trust the process', 'One step at a time');
    });

    expect(result.current.entry).toMatchObject({ focus: 'Trust the process', tagline: 'One step at a time' });
    await waitFor(() => expect(result.current.entry).toMatchObject({ focus: 'Trust the process', tagline: 'One step at a time' }));
  });

  it('should ignore entries saved for other days', async () => {
    await db.focus.add({ date: '2000-01-01', focus: 'Old', tagline: '', updatedAt: 1 } as never);
    const { result } = await renderLoaded();
    expect(result.current.entry).toBeNull();
  });
});
