import { useEffect, useState } from 'react';
import { liveQuery } from 'dexie';

export interface UseLiveCollectionResult<T> {
  data: T | undefined;
  isLoading: boolean;
}

// `querier` must be referentially stable (a module-level function).
export function useLiveCollection<T>(querier: () => Promise<T>): UseLiveCollectionResult<T> {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const subscription = liveQuery(querier).subscribe({
      next: (value) => {
        setData(value);
        setIsLoading(false);
      },
      error: () => setIsLoading(false),
    });

    return () => subscription.unsubscribe();
  }, [querier]);

  return { data, isLoading };
}
