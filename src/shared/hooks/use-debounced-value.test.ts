import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './use-debounced-value';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDebouncedValue', () => {
  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300));

    expect(result.current).toBe('a');
  });

  it('should only publish the latest value after the delay', async () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), { initialProps: { value: 'a' } });

    rerender({ value: 'ab' });
    await act(() => vi.advanceTimersByTimeAsync(299));
    expect(result.current).toBe('a');

    rerender({ value: 'abc' });
    await act(() => vi.advanceTimersByTimeAsync(299));
    expect(result.current).toBe('a');

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(result.current).toBe('abc');
  });
});
