import type { StorageService } from './storage-service';

export class FailSoftStorage implements StorageService {
  constructor(
    private readonly primary: StorageService,
    private readonly fallback: StorageService
  ) {}

  get<T>(key: string): Promise<T | null> {
    return this.run((s) => s.get<T>(key), null);
  }

  set<T>(key: string, value: T): Promise<void> {
    return this.run((s) => s.set(key, value), undefined);
  }

  remove(key: string): Promise<void> {
    return this.run((s) => s.remove(key), undefined);
  }

  clear(): Promise<void> {
    return this.run((s) => s.clear(), undefined);
  }

  private async run<R>(op: (s: StorageService) => Promise<R>, empty: R): Promise<R> {
    for (const backend of [this.primary, this.fallback]) {
      try {
        return await op(backend);
      } catch {
        // try the next backend
      }
    }
    return empty;
  }
}
