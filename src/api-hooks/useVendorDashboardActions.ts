"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
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

    return {
        updateMyVendor,
        deleteProductItem,
        deleteProduct,

        // queries
        useGetMyVendor: () =>
            useQuery(trpc.vendors.getMyVendor.queryOptions()),
        useGetMyProducts: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.vendors.getMyProducts.queryOptions(input ?? {})),
        useGetMyProductItems: (input?: { take?: number; skip?: number; productId?: string }) =>
            useQuery(trpc.vendors.getMyProductItems.queryOptions(input ?? {})),
        useGetMyOrders: (input?: { take?: number; skip?: number; status?: OrderStatus }) =>
            useQuery(trpc.vendors.getMyOrders.queryOptions(input ?? {})),
    };
}

