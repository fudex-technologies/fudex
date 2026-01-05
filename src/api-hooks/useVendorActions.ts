"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

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

        // vendors
        useGetVendorById: (input: { id: string }) =>
            useQuery(trpc.vendors.getById.queryOptions(input, { enabled: !!input.id })),
        useGetVendorBySlug: (input: { slug: string }) =>
            useQuery(trpc.vendors.getBySlug.queryOptions(input)),
        useVendorsSearch: (input: { q?: string; categoryId?: string; categoryIds?: string[]; take?: number; skip?: number }) =>
            useQuery(trpc.vendors.search.queryOptions(input)),
        useListVendors: (input?: { q?: string; take?: number; skip?: number }) =>
            useQuery(trpc.vendors.list.queryOptions(input ?? {})),
        usePopularVendors: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.vendors.getPopularVendors.queryOptions(input ?? {})),
    };
}