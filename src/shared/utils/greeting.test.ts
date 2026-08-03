import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGreeting } from './greeting';

describe('getGreeting', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('returns Good Morning before noon', () => {
    vi.setSystemTime(new Date('2025-01-01T08:00:00'));
    expect(getGreeting()).toBe('Good Morning');
  });

  it('returns Good Afternoon between noon and 5pm', () => {
    vi.setSystemTime(new Date('2025-01-01T14:00:00'));
    expect(getGreeting()).toBe('Good Afternoon');
  });

  it('returns Good Evening after 5pm', () => {
    vi.setSystemTime(new Date('2025-01-01T19:00:00'));
    expect(getGreeting()).toBe('Good Evening');
  });

  it('includes the name when provided', () => {
    vi.setSystemTime(new Date('2025-01-01T08:00:00'));
    expect(getGreeting('Kelvin')).toBe('Good Morning, Kelvin');
  });
});
