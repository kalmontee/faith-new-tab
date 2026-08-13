import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import GratitudeCard from './GratitudeCard';
import type { GratitudeEntry } from '@/shared/types/table';

vi.mock('../hooks/use-today-gratitude', () => ({
  useTodayGratitude: vi.fn(),
}));

import { useTodayGratitude } from '../hooks/use-today-gratitude';

function mockGratitude(entryText: string | null) {
  const entry: GratitudeEntry | null = entryText
    ? { id: 1, date: '2025-01-01', entry: entryText, updatedAt: 1 }
    : null;
  vi.mocked(useTodayGratitude).mockReturnValue({ entry, isLoading: false, save: vi.fn() });
}

describe('GratitudeCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should offer an "Add a Gratitude" action when today has no entry', () => {
    mockGratitude(null);
    render(<GratitudeCard />);

    expect(screen.getByRole('button', { name: /add a gratitude/i })).toBeTruthy();
    // The bare "Edit" action should not be shown while empty.
    expect(screen.queryByRole('button', { name: /^edit$/i })).toBeNull();
  });

  it('should offer an "Edit" action once today has an entry', () => {
    mockGratitude('Grateful for rest');
    render(<GratitudeCard />);

    expect(screen.getByRole('button', { name: /^edit$/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /add a gratitude/i })).toBeNull();
  });

  it('should open the editor when the add action is clicked', () => {
    mockGratitude(null);
    render(<GratitudeCard />);

    fireEvent.click(screen.getByRole('button', { name: /add a gratitude/i }));

    expect(screen.getByRole('textbox')).toBeTruthy();
  });
});
