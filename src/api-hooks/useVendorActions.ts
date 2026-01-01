"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

export function useVendorProductActions() {
    const trpc = useTRPC();

    const createProduct = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.createProduct.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Product created");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to create product", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const createProductWithItems = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.createProductWithItems.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Product and variants created");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to create product with items", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const createProductItem = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.createProductItem.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Variant created");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to create variant", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const updateProductItem = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.updateProductItem.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Variant updated");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to update variant", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const updateProduct = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.updateProduct.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Product updated");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to update product", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    return {
        createProduct,
        createProductWithItems,
        createProductItem,
        updateProductItem,
        updateProduct,

        // read helpers (use inside components directly)
        useListProductItems: (input: { vendorId: string; take?: number }) =>
            useQuery(trpc.vendors.listProductItems.queryOptions(input)),
        useGetProductItemById: (input: { id: string }) =>
            useQuery(trpc.vendors.getProductItemById.queryOptions(input)),
        useGetProductItemsByIds: (input: { ids: string[] }) =>
            useQuery(trpc.vendors.getProductItemsByIds.queryOptions(input)),
        useGetProductWithItems: (input: { id: string }) =>
            useQuery(trpc.vendors.getProductWithItems.queryOptions(input)),
        useGetAddonProductItems: (input: { vendorId: string; excludeProductItemIds?: string[]; take?: number }) =>
            useQuery(trpc.vendors.getAddonProductItems.queryOptions(input)),
        useGetVendorById: (input: { id: string }) =>
            useQuery(trpc.vendors.getById.queryOptions(input, { enabled: !!input.id })),
        useGetVendorBySlug: (input: { slug: string }) =>
            useQuery(trpc.vendors.getBySlug.queryOptions(input)),
        useSearch: (input: { q?: string; categoryId?: string; take?: number; skip?: number }) =>
            useQuery(trpc.vendors.search.queryOptions(input)),
    };
}