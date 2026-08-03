import { describe, it, expect } from 'vitest';
import { dayOfYear, pickDaily } from './daily-rotation';

describe('dayOfYear', () => {
  it('returns 1 for January 1st', () => {
    expect(dayOfYear(new Date(2025, 0, 1, 12, 0, 0))).toBe(1);
  });

  it('returns 2 for January 2nd', () => {
    expect(dayOfYear(new Date(2025, 0, 2, 12, 0, 0))).toBe(2);
  });

  it('returns 32 for February 1st', () => {
    expect(dayOfYear(new Date(2025, 1, 1, 12, 0, 0))).toBe(32);
  });

  it('is stable across different times on the same day', () => {
    const morning = dayOfYear(new Date(2025, 5, 15, 0, 30, 0));
    const night = dayOfYear(new Date(2025, 5, 15, 23, 30, 0));
    expect(morning).toBe(night);
  });
});

describe('pickDaily', () => {
  const items = ['a', 'b', 'c'];

  it('picks the item at the day-of-year index modulo the list length', () => {
    expect(pickDaily(items, new Date(2025, 0, 1, 12, 0, 0))).toBe('b'); // day 1 -> 1 % 3 = 1
    expect(pickDaily(items, new Date(2025, 0, 2, 12, 0, 0))).toBe('c'); // day 2 -> 2 % 3 = 2
    expect(pickDaily(items, new Date(2025, 0, 3, 12, 0, 0))).toBe('a'); // day 3 -> 3 % 3 = 0
  });

  it('wraps around when day-of-year exceeds the list length', () => {
    expect(pickDaily(items, new Date(2025, 0, 4, 12, 0, 0))).toBe('b'); // day 4 -> 4 % 3 = 1
  });

  it('returns the same item for the same day regardless of time', () => {
    const first = pickDaily(items, new Date(2025, 2, 10, 1, 0, 0));
    const second = pickDaily(items, new Date(2025, 2, 10, 22, 0, 0));
    expect(first).toBe(second);
  });
});
