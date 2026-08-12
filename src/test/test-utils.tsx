import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// A fresh QueryClient with retries disabled so error paths resolve immediately
// instead of waiting through backoff. Create one per test to avoid cache bleed.
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      // Some hooks pin `retry` themselves, which overrides this default — so also
      // zero out the backoff delay to keep those retries instant in tests.
      queries: { retry: false, retryDelay: 0, gcTime: 0 },
    },
  });
}

// Wrapper for renderHook that provides a React Query context. The client is
// instantiated once and closed over so it survives re-renders (a client created
// inside the wrapper body would reset on every render and flake).
export function createQueryWrapper(client = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}
