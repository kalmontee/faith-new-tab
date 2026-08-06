import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let fetchDailyVerse: typeof import('./verse-api').fetchDailyVerse;

// OurManna Verse of the Day response shape
const MOCK_OURMANNA_RESPONSE = {
  verse: {
    details: {
      text: 'But seek first his kingdom and his righteousness, and all these things will be given to you as well.',
      reference: 'Matthew 6:33',
      version: 'NIV',
      verseurl: 'http://www.ourmanna.com/',
    },
    notice: 'Powered by OurManna.com',
  },
};

describe('fetchDailyVerse', () => {
  beforeEach(async () => {
    vi.stubGlobal('fetch', vi.fn());
    ({ fetchDailyVerse } = await import('./verse-api'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps the OurManna response into a DailyVerse', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(MOCK_OURMANNA_RESPONSE),
    } as Response);

    const verse = await fetchDailyVerse();

    expect(verse.reference).toBe('Matthew 6:33');
    expect(verse.text).toBe('But seek first his kingdom and his righteousness, and all these things will be given to you as well.');
    expect(verse.translation).toBe('NIV');
    expect(typeof verse.fetchedAt).toBe('number');
  });

  it('requests the daily verse in JSON format', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(MOCK_OURMANNA_RESPONSE),
    } as Response);

    await fetchDailyVerse();

    const calledUrl = vi.mocked(fetch).mock.calls[0]?.[0] as string;
    expect(calledUrl).toContain('format=json');
    expect(calledUrl).toContain('order=daily');
  });

  it('trims whitespace from the verse text', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          verse: { details: { ...MOCK_OURMANNA_RESPONSE.verse.details, text: '  Trimmed verse.  \n' } },
        }),
    } as Response);

    const verse = await fetchDailyVerse();
    expect(verse.text).toBe('Trimmed verse.');
  });

  it('throws when the API returns a non-ok status', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as Response);

    await expect(fetchDailyVerse()).rejects.toThrow('OurManna API error: 503');
  });

  it('throws a Zod error when the response shape is invalid', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ unexpected: 'shape' }),
    } as Response);

    await expect(fetchDailyVerse()).rejects.toThrow();
  });
});
