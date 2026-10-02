import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

const RETRY_DELAY_MS = 1_000;

export interface UseLiveCollectionResult<T> {
  data: T | undefined;
  isLoading: boolean;
}

// `querier` must be referentially stable (a module-level function).
export function useLiveCollection<T>(querier: () => Promise<T>): UseLiveCollectionResult<T> {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);

  const [attempt, setAttempt] = useState(0);

  // A failed liveQuery ends its subscription for good, so resubscribe or later writes never show.
  useEffect(() => {
    let retry: ReturnType<typeof setTimeout> | undefined;
    const subscription = liveQuery(querier).subscribe({
      next: (value) => {
        setData(value);
        setIsLoading(false);
      },
      error: () => {
        setIsLoading(false);
        retry = setTimeout(() => setAttempt((n) => n + 1), RETRY_DELAY_MS);
      },
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(retry);
    };
  }, [querier, attempt]);

  return { data, isLoading };
}
