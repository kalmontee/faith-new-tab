import { describe, it, expect } from 'vitest';
import { getDailyQuote } from './quote-service';
import { QUOTES } from './quotes-data';

describe('getDailyQuote', () => {
  it('returns a quote that is a member of the bundled quote set', () => {
    const quote = getDailyQuote(new Date(2025, 0, 1, 12, 0, 0));
    expect(QUOTES).toContainEqual(quote);
  });

  it('returns the same quote for the same calendar day regardless of time', () => {
    const morning = getDailyQuote(new Date(2025, 3, 10, 0, 30, 0));
    const night = getDailyQuote(new Date(2025, 3, 10, 23, 30, 0));
    expect(morning).toEqual(night);
  });

  it('rotates to a different quote on a different day when the set has more than one entry', () => {
    const day1 = getDailyQuote(new Date(2025, 0, 1, 12, 0, 0));
    const day2 = getDailyQuote(new Date(2025, 0, 2, 12, 0, 0));
    expect(QUOTES.length).toBeGreaterThan(1);
    expect(day1).not.toEqual(day2);
  });

  it('wraps around once every quote in the set has been shown', () => {
    const first = getDailyQuote(new Date(2025, 0, 1, 12, 0, 0));
    const wrapped = getDailyQuote(new Date(2025, 0, 1 + QUOTES.length, 12, 0, 0));
    expect(wrapped).toEqual(first);
  });

  it('returns an object with both text and author', () => {
    const quote = getDailyQuote(new Date(2025, 0, 1, 12, 0, 0));
    expect(quote).toHaveProperty('text');
    expect(quote).toHaveProperty('author');
    expect(quote.text.length).toBeGreaterThan(0);
    expect(quote.author.length).toBeGreaterThan(0);
  });
});
