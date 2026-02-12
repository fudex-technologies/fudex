"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { OrderStatus } from "@prisma/client";

export function usePackageActions() {
    const trpc = useTRPC();

    return {
        // ========== PUBLIC PACKAGE QUERIES ==========
        useListActivePackages: () =>
            useQuery(trpc.packages.public.listActivePackages.queryOptions(undefined)),

        useGetPackageBySlug: (input: { slug: string }, options?: { enabled?: boolean }) =>
            useQuery(
                trpc.packages.public.getPackageBySlug.queryOptions(input, {
                    enabled: options?.enabled ?? !!input.slug,
                })
            ),

        useGetPackageCategory: (
            input: { packageSlug: string; categorySlug: string },
            options?: { enabled?: boolean }
        ) =>
            useQuery(
                trpc.packages.public.getPackageCategory.queryOptions(input, {
                    enabled: options?.enabled ?? !!(input.packageSlug && input.categorySlug),
                })
            ),

        useGetPackageItemById: (input: { id: string }, options?: { enabled?: boolean }) =>
            useQuery(
                trpc.packages.public.getPackageItemById.queryOptions(input, {
                    enabled: options?.enabled ?? !!input.id,
                })
            ),

        // ========== PACKAGE ORDER QUERIES ==========
        useGetMyPackageOrders: (
            input?: {
                limit?: number;
                cursor?: string;
                status?: OrderStatus;
            },
            options?: { enabled?: boolean }
        ) =>
            useQuery(
                trpc.packages.public.getMyPackageOrders.queryOptions(input ?? {}, {
                    enabled: options?.enabled ?? true,
                })
            ),

        useInfiniteGetMyPackageOrders: (
            input?: {
                limit?: number;
                status?: OrderStatus;
            },
            options?: { enabled?: boolean }
        ) =>
            useInfiniteQuery(
                trpc.packages.public.getMyPackageOrders.infiniteQueryOptions(
                    input ?? {},
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        useGetPackageOrderById: (input: { id: string }, options?: { enabled?: boolean }) =>
            useQuery(
                trpc.packages.public.getPackageOrderById.queryOptions(input, {
                    enabled: options?.enabled ?? !!input.id,
                })
            ),

        // ========== PACKAGE ORDER MUTATIONS ==========
        createPackageOrder: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.public.createPackageOrder.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package order created successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to create package order", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        createPackagePayment: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.public.createPackagePayment.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Payment initialized");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to create payment", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        verifyPackagePayment: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.public.verifyPackagePayment.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Payment verified successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to verify payment", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
    };
}

export function usePackageAdminActions() {
    const trpc = useTRPC();

    return {
        // ========== PACKAGE MANAGEMENT ==========
        useListPackages: (
            input?: {
                limit?: number;
                cursor?: string;
                isActive?: boolean;
            },
            options?: { enabled?: boolean }
        ) =>
            useQuery(
                trpc.packages.admin.listPackages.queryOptions(input ?? {}, {
                    enabled: options?.enabled ?? true,
                })
            ),

        useGetPackageById: (input: { id: string }, options?: { enabled?: boolean }) =>
            useQuery(
                trpc.packages.admin.getPackageById.queryOptions(input, {
                    enabled: options?.enabled ?? !!input.id,
                })
            ),

        createPackage: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.createPackage.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package created successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to create package", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        updatePackage: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.updatePackage.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package updated successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to update package", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        deletePackage: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.deletePackage.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package deleted successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to delete package", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // ========== CATEGORY MANAGEMENT ==========
        createCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.createCategory.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Category created successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to create category", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        updateCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.updateCategory.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Category updated successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to update category", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        deleteCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.deleteCategory.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Category deleted successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to delete category", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // ========== PACKAGE ITEM MANAGEMENT ==========
        createPackageItem: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.createPackageItem.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package item created successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to create package item", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        updatePackageItem: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.updatePackageItem.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package item updated successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to update package item", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        deletePackageItem: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.deletePackageItem.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package item deleted successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to delete package item", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // ========== PACKAGE ADDON MANAGEMENT ==========
        useAddPackageAddon: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.addPackageAddon.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package addon added successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to add package addon", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                })
            ),

        useRemovePackageAddon: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.removePackageAddon.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package addon removed successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to remove package addon", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                })
            ),

        useTogglePackageAddonStatus: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.togglePackageAddonStatus.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package addon status updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to update status", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                })
            ),

        useUpdatePackageAddonOrder: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.updatePackageAddonOrder.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Addon order updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to update order", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                })
            ),

        useSearchProductItemsForAddon: (
            input: { query?: string; limit?: number },
            options?: { enabled?: boolean }
        ) =>
            useQuery(
                trpc.packages.admin.searchProductItemsForAddon.queryOptions(input, {
                    enabled: options?.enabled ?? true,
                })
            ),
    };
}

