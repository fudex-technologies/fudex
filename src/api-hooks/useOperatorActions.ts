"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
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
        useListOrdersInArea: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.operators.listOrdersInArea.queryOptions(input ?? {})),
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
        useListRiders: () =>
            useQuery(trpc.operators.listRiders.queryOptions(undefined)),
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
        useListCategories: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.operators.listCategories.queryOptions(input ?? {})),
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
        useListVendors: (input?: { take?: number; skip?: number; q?: string }) =>
            useQuery(trpc.operators.listVendors.queryOptions(input ?? {})),
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
    };
}

