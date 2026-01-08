"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { RatingFilterType } from "@/modules/vendors/schema";

export function useVendorProductActions() {
    const trpc = useTRPC();

    return {
        // read helpers
        // products
        useListProductItems: (input: { vendorId: string; take?: number }) =>
            useQuery(trpc.vendors.listProductItems.queryOptions(input)),
        useGetProductItemById: (input: { id: string }) =>
            useQuery(trpc.vendors.getProductItemById.queryOptions(input)),
        useGetProductItemsByIds: (input: { ids: string[] }) =>
            useQuery(trpc.vendors.getProductItemsByIds.queryOptions(input, { enabled: input.ids.length > 0 })),
        useGetProductWithItems: (input: { id: string }) =>
            useQuery(trpc.vendors.getProductWithItems.queryOptions(input)),
        useGetAddonProductItems: (input: { vendorId: string; excludeProductItemIds?: string[]; take?: number }) =>
            useQuery(trpc.vendors.getAddonProductItems.queryOptions(input)),
        useGetProductItemsByCategorySlug: (input: { categorySlug: string; vendorId: string; includeOutOfStock?: boolean }) =>
            useQuery(trpc.vendors.getProductItemsByCategorySlug.queryOptions(input)),

        // vendors
        useGetVendorById: (input: { id: string }) =>
            useQuery(trpc.vendors.getById.queryOptions(input, { enabled: !!input.id })),
        useGetVendorBySlug: (input: { slug: string }) =>
            useQuery(trpc.vendors.getBySlug.queryOptions(input)),
        useVendorsSearch: (input: { q?: string; categoryId?: string; categoryIds?: string[]; take?: number; skip?: number }) =>
            useQuery(trpc.vendors.search.queryOptions(input)),
        useInfiniteSearchVendors: (input: { q?: string; categoryId?: string; categoryIds?: string[]; limit?: number }) =>
            useInfiniteQuery(
                trpc.vendors.searchInfinite.infiniteQueryOptions(
                    {
                        ...input,
                        limit: input.limit ?? 20,
                    },
                    {
                        getNextPageParam: (lastPage) => lastPage.nextCursor,
                        initialCursor: 0,
                    }
                )
            ),
        useListVendors: (input?: { q?: string; take?: number; skip?: number, ratingFilter?: RatingFilterType }) =>
            useQuery(trpc.vendors.list.queryOptions(input ?? {})),
        useInfiniteListVendors: (input?: { q?: string; limit?: number; ratingFilter?: RatingFilterType }) =>
            useInfiniteQuery(
                trpc.vendors.listInfinite.infiniteQueryOptions(
                    {
                        limit: input?.limit ?? 20,
                        q: input?.q,
                        ratingFilter: input?.ratingFilter,
                    },
                    {
                        getNextPageParam: (lastPage) => lastPage.nextCursor,
                        initialCursor: 0,
                    }
                )
            ),
        usePopularVendors: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.vendors.getPopularVendors.queryOptions(input ?? {})),
        useGetMyOpeningHours: () => useQuery(trpc.vendors.getMyOpeningHours.queryOptions()),
        useSetMyOpeningHours: () => useMutation(trpc.vendors.setMyOpeningHours.mutationOptions({
            onError: (err) => {
                // handle error
            }
        })),
        useVendorReviewsInfinite: (vendorId: string, limit = 10) =>
            useInfiniteQuery(
                trpc.vendors.listVendorReviewsInfinite.infiniteQueryOptions(
                    { vendorId, limit },
                    {
                        getNextPageParam: (lastPage) => lastPage.nextCursor,
                        initialCursor: 0,
                    }
                )
            ),
    };
}