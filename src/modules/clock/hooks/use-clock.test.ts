import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildClockState } from './use-clock';

// Use the Date constructor with explicit components to avoid timezone ambiguity.
// getHours() / toLocaleDateString() operate on local time, so we construct
// local midnight / noon rather than relying on ISO-string parsing.

describe('buildClockState', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  // ── Time display ──────────────────────────────────────────────────────────

  describe('12-hour time formatting', () => {
    it('formats midnight (0:00) as 12:00 AM', () => {
      const state = buildClockState(new Date(2025, 0, 1, 0, 0, 0));
      expect(state.time).toBe('12:00');
      expect(state.period).toBe('AM');
    });

    it('formats noon (12:00) as 12:00 PM', () => {
      const state = buildClockState(new Date(2025, 0, 1, 12, 0, 0));
      expect(state.time).toBe('12:00');
      expect(state.period).toBe('PM');
    });

    it('converts 13:00 to 1:00 PM', () => {
      const state = buildClockState(new Date(2025, 0, 1, 13, 0, 0));
      expect(state.time).toBe('1:00');
      expect(state.period).toBe('PM');
    });

    it('converts 23:59 to 11:59 PM', () => {
      const state = buildClockState(new Date(2025, 0, 1, 23, 59, 0));
      expect(state.time).toBe('11:59');
      expect(state.period).toBe('PM');
    });

    it('converts 11:00 to 11:00 AM', () => {
      const state = buildClockState(new Date(2025, 0, 1, 11, 0, 0));
      expect(state.time).toBe('11:00');
      expect(state.period).toBe('AM');
    });

    it('pads single-digit minutes with a leading zero', () => {
      const state = buildClockState(new Date(2025, 0, 1, 8, 5, 0));
      expect(state.time).toBe('8:05');
    });

    it('does not pad single-digit hour', () => {
      const state = buildClockState(new Date(2025, 0, 1, 9, 0, 0));
      expect(state.time).toBe('9:00');
    });

    it('handles two-digit minutes that do not need padding', () => {
      const state = buildClockState(new Date(2025, 0, 1, 8, 30, 0));
      expect(state.time).toBe('8:30');
    });
  });

  // ── AM / PM ───────────────────────────────────────────────────────────────

  describe('period', () => {
    it.each([0, 1, 6, 11])('returns AM for hour %i', (h) => {
      expect(buildClockState(new Date(2025, 0, 1, h, 0, 0)).period).toBe('AM');
    });

    it.each([12, 13, 17, 23])('returns PM for hour %i', (h) => {
      expect(buildClockState(new Date(2025, 0, 1, h, 0, 0)).period).toBe('PM');
    });
  });

  // ── Date string ───────────────────────────────────────────────────────────

  describe('date string', () => {
    it('includes the full weekday name', () => {
      // 2025-01-01 is a Wednesday
      const state = buildClockState(new Date(2025, 0, 1, 12, 0, 0));
      expect(state.date).toContain('Wednesday');
    });

    it('includes the month name', () => {
      const state = buildClockState(new Date(2025, 0, 1, 12, 0, 0));
      expect(state.date).toContain('January');
    });

    it('includes the year', () => {
      const state = buildClockState(new Date(2025, 0, 1, 12, 0, 0));
      expect(state.date).toContain('2025');
    });

    it('includes the day number', () => {
      const state = buildClockState(new Date(2025, 0, 15, 12, 0, 0));
      expect(state.date).toContain('15');
    });
  });

  // ── Greeting delegation ───────────────────────────────────────────────────

  describe('greeting', () => {
    it('returns a morning greeting before noon', () => {
      const state = buildClockState(new Date(2025, 0, 1, 8, 0, 0));
      expect(state.greeting).toBe('Good Morning');
    });

    it('returns an afternoon greeting in the afternoon', () => {
      const state = buildClockState(new Date(2025, 0, 1, 14, 0, 0));
      expect(state.greeting).toBe('Good Afternoon');
    });

    it('returns an evening greeting in the evening', () => {
      const state = buildClockState(new Date(2025, 0, 1, 19, 0, 0));
      expect(state.greeting).toBe('Good Evening');
    });

    it('appends the user name when provided', () => {
      const state = buildClockState(new Date(2025, 0, 1, 8, 0, 0), 'Kelvin');
      expect(state.greeting).toBe('Good Morning, Kelvin');
    });

    it('omits the name when not provided', () => {
      const state = buildClockState(new Date(2025, 0, 1, 8, 0, 0));
      expect(state.greeting).not.toContain(',');
    });
  });
});
