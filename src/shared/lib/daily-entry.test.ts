import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { db } from '@/shared/storage/app-db';
import { createDailyEntry } from './daily-entry';

const focusEntries = createDailyEntry(db.focus);
const gratitudeEntries = createDailyEntry(db.gratitude);

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
});

afterEach(() => vi.useRealTimers());

describe('createDailyEntry', () => {
  it('should return undefined when nothing is saved for today', async () => {
    expect(await focusEntries.getToday()).toBeUndefined();
  });

  it('should insert a dated entry stamped with the current time', async () => {
    const saved = await focusEntries.saveToday({ focus: 'Seek God first', tagline: 'Trust' });

    expect(saved).toMatchObject({ date: '2025-06-15', focus: 'Seek God first', tagline: 'Trust', updatedAt: Date.now() });
    expect(await focusEntries.getToday()).toEqual(saved);
  });

  it('should update the existing row instead of adding a second one', async () => {
    const first = await focusEntries.saveToday({ focus: 'Original', tagline: 'a' });
    vi.setSystemTime(new Date(2025, 5, 15, 13, 0, 0));
    const second = await focusEntries.saveToday({ focus: 'Revised', tagline: 'b' });

    expect(second.id).toBe(first.id);
    expect(second.date).toBe(first.date);
    expect(second.updatedAt).toBeGreaterThan(first.updatedAt);
    expect(await db.focus.count()).toBe(1);
    expect((await focusEntries.getToday())?.focus).toBe('Revised');
  });

  it('should start a new row on the next day', async () => {
    await gratitudeEntries.saveToday({ entry: 'Yesterday' });
    vi.setSystemTime(new Date(2025, 5, 16, 9, 0, 0));
    await gratitudeEntries.saveToday({ entry: 'Today' });

    expect(await db.gratitude.count()).toBe(2);
    expect((await gratitudeEntries.getToday())?.entry).toBe('Today');
  });
});
