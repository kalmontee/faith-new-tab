import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimisticOverride } from './use-optimistic-override';

describe('useOptimisticOverride', () => {
  it('should return the live value when nothing is overridden', () => {
    const { result } = renderHook(() => useOptimisticOverride('a'));
    expect(result.current[0]).toBe('a');
  });

  it('should show the override until the live value changes', () => {
    const { result, rerender } = renderHook(({ live }) => useOptimisticOverride(live), { initialProps: { live: 'a' } });

    act(() => result.current[1]('b'));
    expect(result.current[0]).toBe('b');

    rerender({ live: 'c' });
    expect(result.current[0]).toBe('c');
  });

  it('should drop the override when cleared', () => {
    const { result } = renderHook(() => useOptimisticOverride('a'));

    act(() => result.current[1]('b'));
    act(() => result.current[2]());

    expect(result.current[0]).toBe('a');
  });
});
