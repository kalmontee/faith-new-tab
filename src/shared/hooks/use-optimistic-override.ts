import { useState } from 'react';

// Shows `value` instead of `live` until `live` emits a new reference, i.e. until storage has caught up.
export function useOptimisticOverride<T>(live: T): [T, (value: T) => void, () => void] {
  const [override, setOverride] = useState<{ base: T; value: T } | null>(null);

  return [
    override && override.base === live ? override.value : live,
    (value) => setOverride({ base: live, value }),
    () => setOverride(null),
  ];
}
