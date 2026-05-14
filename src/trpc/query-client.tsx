// src/trpc/query-client.ts
import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // avoid immediate client refetch
      },
      dehydrate: {
        // Avoid dehydrating pending queries that might later reject during hydration.
        shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query),
      },
    },
  });
}