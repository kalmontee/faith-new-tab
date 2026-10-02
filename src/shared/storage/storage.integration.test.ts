import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from './index';

beforeEach(() => {
  localStorage.clear();
});

describe('StorageIntegration', () => {
  describe('storage with chrome available', () => {
    it('should round-trip a value through chrome.storage.local', async () => {
      await storage.set('k', { a: 1 });

      expect(await storage.get('k')).toEqual({ a: 1 });
      expect(localStorage.getItem('k')).toBeNull();
    });

    it('should remove and clear keys', async () => {
      await storage.set('a', 1);
      await storage.set('b', 2);

      await storage.remove('a');
      expect(await storage.get('a')).toBeNull();

      await storage.clear();
      expect(await storage.get('b')).toBeNull();
    });

    it('should not throw when a chrome write rejects', async () => {
      vi.mocked(chrome.storage.local.set).mockRejectedValueOnce(new Error('quota'));

      await expect(storage.set('k', 'v')).resolves.toBeUndefined();
  });
  });

  describe('storage without chrome', () => {
    beforeEach(() => {
      vi.stubGlobal('chrome', undefined);
    });

    it('should return null for a missing key instead of throwing', async () => {
      expect(await storage.get('missing')).toBeNull();
    });

    it('should round-trip a value through localStorage', async () => {
      await storage.set('k', { a: 1 });

      expect(await storage.get('k')).toEqual({ a: 1 });
    });

    it('should remove and clear keys', async () => {
      await storage.set('a', 1);
      await storage.set('b', 2);

      await storage.remove('a');
      expect(await storage.get('a')).toBeNull();

      await storage.clear();
      expect(await storage.get('b')).toBeNull();
    });

    it('should not throw when localStorage itself fails', async () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied');
      });

      await expect(storage.set('k', 'v')).resolves.toBeUndefined();
      await expect(storage.get('k')).resolves.toBeNull();

      vi.restoreAllMocks();
    });

    it('should read a raw string written by the old localStorage fallback', async () => {
      localStorage.setItem('new-day:settings', '{"state":{"userName":"Ruth"},"version":0}');

      expect(await storage.get('new-day:settings')).toEqual({ state: { userName: 'Ruth' }, version: 0 });
    });
  });
});
