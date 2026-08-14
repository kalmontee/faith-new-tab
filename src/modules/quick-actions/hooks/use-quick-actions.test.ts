import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

import { useQuickActions } from './use-quick-actions';
import { useCurrentVerseStore } from '@/shared/store/current-verse-store';
import { useViewStore } from '@/shared/store/view-store';
import type { CurrentVerse } from '@/shared/types/module';

// Unit test: the hook reads the "verse on screen" from the current-verse store,
// formats it for the clipboard / Web Share API, and delegates favouriting to the
// favorites service (covered by favorites-service.test.ts).
vi.mock('../services/favorites-service', () => ({
  isFavorited: vi.fn(),
  toggleFavorite: vi.fn(),
}));

import { isFavorited, toggleFavorite } from '../services/favorites-service';

const verse: CurrentVerse = {
  reference: 'Philippians 4:13',
  text: 'I can do all things through Christ who strengthens me.',
  translation: 'NIV',
};
const formatted = `"${verse.text}" — ${verse.reference}`;

const writeText = vi.fn();
const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const originalShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share');

beforeEach(() => {
  vi.clearAllMocks();
  useCurrentVerseStore.setState({ verse: null });
  vi.mocked(isFavorited).mockResolvedValue(false);
  vi.mocked(toggleFavorite).mockResolvedValue(true);

  writeText.mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
  });
  // Default: no Web Share API, so share falls back to clipboard.
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
});

afterEach(() => {
  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
  } else {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
  }

  if (originalShareDescriptor) {
    Object.defineProperty(navigator, 'share', originalShareDescriptor);
  } else {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  }
});

describe('useQuickActions', () => {
  it('should report no verse when the store is empty', () => {
    const { result } = renderHook(() => useQuickActions());
    expect(result.current.hasVerse).toBe(false);
    expect(result.current.isFavorite).toBe(false);
  });

  it('should reflect the favourite state of the current verse on mount', async () => {
    useCurrentVerseStore.setState({ verse });
    vi.mocked(isFavorited).mockResolvedValue(true);

    const { result } = renderHook(() => useQuickActions());

    expect(result.current.hasVerse).toBe(true);
    await waitFor(() => expect(result.current.isFavorite).toBe(true));
    expect(isFavorited).toHaveBeenCalledWith(verse.reference);
  });

  it('should copy the formatted verse to the clipboard', async () => {
    useCurrentVerseStore.setState({ verse });
    const { result } = renderHook(() => useQuickActions());

    await act(async () => {
      await result.current.copyVerse();
    });

    expect(writeText).toHaveBeenCalledWith(formatted);
  });

  it('should do nothing on copy when there is no verse', async () => {
    const { result } = renderHook(() => useQuickActions());

    await act(async () => {
      await result.current.copyVerse();
    });

    expect(writeText).not.toHaveBeenCalled();
  });

  it('should share via the Web Share API when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { value: share, configurable: true });
    useCurrentVerseStore.setState({ verse });

    const { result } = renderHook(() => useQuickActions());
    await act(async () => {
      await result.current.shareVerse();
    });

    expect(share).toHaveBeenCalledWith({ text: formatted });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('should fall back to the clipboard when the Web Share API is unavailable', async () => {
    useCurrentVerseStore.setState({ verse });
    const { result } = renderHook(() => useQuickActions());

    await act(async () => {
      await result.current.shareVerse();
    });

    expect(writeText).toHaveBeenCalledWith(formatted);
  });

  it('should toggle the favourite and update the flag from the service result', async () => {
    useCurrentVerseStore.setState({ verse });
    vi.mocked(isFavorited).mockResolvedValue(false);
    vi.mocked(toggleFavorite).mockResolvedValue(true);

    const { result } = renderHook(() => useQuickActions());
    await waitFor(() => expect(result.current.isFavorite).toBe(false));

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(toggleFavorite).toHaveBeenCalledWith(verse);
    expect(result.current.isFavorite).toBe(true);
  });

  it('should open the settings view via the view store', () => {
    useViewStore.setState({ view: 'dashboard' });

    const { result } = renderHook(() => useQuickActions());
    act(() => result.current.openSettings());

    expect(useViewStore.getState().view).toBe('settings');
  });

  it('should propagate a clipboard write failure', async () => {
    useCurrentVerseStore.setState({ verse });
    writeText.mockRejectedValue(new Error('clipboard blocked'));

    const { result } = renderHook(() => useQuickActions());
    await expect(result.current.copyVerse()).rejects.toThrow('clipboard blocked');
  });

  it('should not attempt to favourite when there is no verse', async () => {
    const { result } = renderHook(() => useQuickActions());

    await act(async () => {
      await result.current.toggleFavorite();
    });

    expect(toggleFavorite).not.toHaveBeenCalled();
  });
});
