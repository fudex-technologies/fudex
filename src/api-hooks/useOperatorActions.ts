"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { OrderStatus } from "@prisma/client";

export function useOperatorActions() {
    const trpc = useTRPC();

    return {
        // Check operator role
        useCheckOperatorRole: () =>
            useQuery(trpc.operators.checkOperatorRole.queryOptions(undefined)),

        // Orders
        useListOrders: (input: { limit?: number; cursor?: string; status?: OrderStatus; areaId?: string } = {}) =>
            useQuery(trpc.operators.listOrders.queryOptions(input)),

        useInfiniteListOrders: (input: { limit?: number; status?: OrderStatus; areaId?: string } = {}) =>
            useInfiniteQuery(
                trpc.operators.listOrders.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        updateOrderStatus: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.updateOrderStatus.mutationOptions({
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
            ),
        assignRiderToOrder: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.assignRiderToOrder.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Rider assigned to order");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to assign rider", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Riders
        useListRiders: (input: { limit?: number; cursor?: string; areaId?: string } = {}) =>
            useQuery(trpc.operators.listRiders.queryOptions(input)),

        useInfiniteListRiders: (input: { limit?: number; areaId?: string } = {}) =>
            useInfiniteQuery(
                trpc.operators.listRiders.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        createRider: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.createRider.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Rider created");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to create rider", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        updateRider: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.updateRider.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Rider updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update rider", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Categories
        useListCategories: (input: { limit?: number; cursor?: string } = {}) =>
            useQuery(trpc.operators.listCategories.queryOptions(input)),

        useInfiniteListCategories: (input: { limit?: number } = {}) =>
            useInfiniteQuery(
                trpc.operators.listCategories.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        createCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.createCategory.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Category created");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to create category", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        updateCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.updateCategory.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Category updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update category", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        deleteCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.deleteCategory.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Category deleted");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to delete category", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Vendors
        useListVendors: (input: { limit?: number; cursor?: string; q?: string } = {}) =>
            useQuery(trpc.operators.listVendors.queryOptions(input)),

        useInfiniteListVendors: (input: { limit?: number; q?: string } = {}) =>
            useInfiniteQuery(
                trpc.operators.listVendors.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        updateVendor: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.operators.updateVendor.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Vendor updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update vendor", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Package Orders
        useListPackageOrders: (input: { limit?: number; cursor?: string; status?: OrderStatus; search?: string } = { limit: 20 }) =>
            useQuery(trpc.packages.admin.listPackageOrders.queryOptions(input)),

        useInfiniteListPackageOrders: (input: { limit?: number; status?: OrderStatus; search?: string } = { limit: 20 }) =>
            useInfiniteQuery(
                trpc.packages.admin.listPackageOrders.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        useGetPackageOrderById: (input: { id: string }, options?: { enabled?: boolean }) =>
            useQuery(
                trpc.packages.admin.getPackageOrderById.queryOptions(input, {
                    enabled: options?.enabled ?? !!input.id,
                })
            ),

        updatePackageOrderStatus: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.packages.admin.updatePackageOrderStatus.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Package order status updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update package order status", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
    };
}

