import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

import QuickActionsCard from './QuickActionsCard';
import { useCurrentVerseStore } from '@/shared/store/current-verse-store';

beforeEach(() => {
  useCurrentVerseStore.setState({ verse: null });
});

const verseActions = ['Share Verse', 'Copy Verse', 'Favorite'];

describe('QuickActionsCard', () => {
  it('should disable the verse actions until a verse is published', () => {
    render(<QuickActionsCard />);

    for (const name of verseActions) {
      expect((screen.getByRole('button', { name: new RegExp(name, 'i') }) as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('should keep Settings available without a verse', () => {
    render(<QuickActionsCard />);
    expect((screen.getByRole('button', { name: /settings/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it('should enable the verse actions once a verse is published', () => {
    render(<QuickActionsCard />);

    act(() => {
      useCurrentVerseStore.getState().setCurrentVerse({ reference: 'John 3:16', text: 'For God so loved the world.', translation: 'NIV' });
    });

    for (const name of verseActions) {
      expect((screen.getByRole('button', { name: new RegExp(name, 'i') }) as HTMLButtonElement).disabled).toBe(false);
    }
  });
});
