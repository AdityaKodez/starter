import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { createTRPCClient, httpLink } from '@trpc/client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

type PrefetchableQueryOptions = {
  queryKey: readonly [unknown, { type?: string }?, ...unknown[]];
};

type QueryPrefetchOptions = Parameters<
  ReturnType<typeof getQueryClient>['prefetchQuery']
>[0];
type InfinitePrefetchOptions = Parameters<
  ReturnType<typeof getQueryClient>['prefetchInfiniteQuery']
>[0];

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});
// If your router is on a separate server, pass a client:
createTRPCOptionsProxy({
  client: createTRPCClient({
    links: [httpLink({ url: '...' })],
  }),
  queryClient: getQueryClient,
});
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

export function prefetch<T extends PrefetchableQueryOptions>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    return queryClient.prefetchInfiniteQuery(
      queryOptions as unknown as InfinitePrefetchOptions,
    );
  } else {
    return queryClient.prefetchQuery(queryOptions as unknown as QueryPrefetchOptions);
  }
}
