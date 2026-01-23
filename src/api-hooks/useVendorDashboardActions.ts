"use client";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { OrderStatus } from "@prisma/client";

export function useVendorDashboardActions() {
    const trpc = useTRPC();

    const updateMyVendor = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.updateMyVendor.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Vendor profile updated");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to update vendor profile", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

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

    const deleteProduct = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.deleteProduct.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Product deleted");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to delete product", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const deleteProductItem = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.vendors.deleteProductItem.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Product item deleted");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to delete product item", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );



    const updateOrderStatus = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.orders.updateMyOrderStatus.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Order status updated");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to update order status", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    return {
        updateMyVendor,
        createProduct,
        createProductItem,
        createProductWithItems,
        updateProductItem,
        updateProduct,
        deleteProduct,
        deleteProductItem,
        updateOrderStatus,

        // queries
        useGetMyVendor: () =>
            useQuery(trpc.vendors.getMyVendor.queryOptions()),
        useGetMyProducts: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.vendors.getMyProducts.queryOptions(input ?? {})),
        useGetMyProductItems: (input?: { take?: number; skip?: number; productId?: string }) =>
            useQuery(trpc.vendors.getMyProductItems.queryOptions(input ?? {})),
        useGetMyOrders: (input?: { take?: number; skip?: number; status?: OrderStatus[] }) =>
            useQuery(trpc.vendors.getMyOrders.queryOptions(
                { ...input },
                {
                    // Mark data as stale immediately so it refetches on mount
                    staleTime: 0,
                    // Refetch when component mounts or window regains focus
                    refetchOnMount: 'always',
                    refetchOnWindowFocus: true,
                }
            )),
        useGetMyOrderCounts: () =>
            useQuery(trpc.vendors.getMyOrderCounts.queryOptions(
                {},
                {
                    // Mark data as stale immediately so it refetches on mount
                    staleTime: 0,
                    // Refetch when component mounts or window regains focus
                    refetchOnMount: 'always',
                    refetchOnWindowFocus: true,
                }
            )),
        useGetSupportedBanks: () =>
            useQuery(trpc.vendors.getSupportedBanks.queryOptions()),
        useGetMyOrdersInfinite: (input?: { limit?: number; status?: OrderStatus[] }) =>
            useInfiniteQuery(
                trpc.vendors.getMyOrdersInfinite.infiniteQueryOptions(
                    {
                        limit: input?.limit ?? 20,
                        status: input?.status,
                    },
                    {
                        getNextPageParam: (lastPage) => lastPage.nextCursor,
                        initialCursor: 0,

                        // Mark data as stale immediately so it refetches on mount
                        staleTime: 0,
                        // Refetch when component mounts or window regains focus
                        refetchOnMount: 'always',
                        refetchOnWindowFocus: true,
                    }
                )
            ),
    };
}

