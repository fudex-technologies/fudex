import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
// import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Increase stale time to 5 minutes for better caching
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Set cache time to 10 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        // Retry failed requests
        retry: 2,
        // Refetch on window focus for critical data
        refetchOnWindowFocus: true,
        // Refetch on reconnect
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations
        retry: 1,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
}


// function makeQueryClient() {
//   return new QueryClient({
//     defaultOptions: {
//       queries: {
//         // With SSR, we usually want to set some default staleTime
//         // above 0 to avoid refetching immediately on the client
//         staleTime: 60 * 1000,
//       },
//     },
//   });
// }
// let browserQueryClient: QueryClient | undefined = undefined;

// function getQueryClient() {
//   if (typeof window === 'undefined') {
//     // Server: always make a new query client
//     return makeQueryClient();
//   } else {
//     // Browser: make a new query client if we don't already have one
//     // This is very important, so we don't re-make a new client if React
//     // suspends during the initial render. This may not be needed if we
//     // have a suspense boundary BELOW the creation of the query client
//     if (!browserQueryClient) browserQueryClient = makeQueryClient();
//     return browserQueryClient;
//   }
// }