"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

export function useDiscountActions() {
    const trpc = useTRPC() as any;

    return {
        // List discounts for admin
        useListDiscounts: (input: { take?: number; skip?: number; status?: string; search?: string }) =>
            useQuery(trpc.discounts.listDiscounts.queryOptions(input)),

        // Get single discount
        useGetDiscountById: (input: { id: string }) =>
            useQuery(trpc.discounts.getDiscountById.queryOptions(input, { enabled: !!input.id })),

        // Create discount
        createDiscount: (options?: UseAPICallerOptions) =>
            useMutation<any, any, any>(
                trpc.discounts.createDiscount.mutationOptions({
                    onSuccess: (data: any) => {
                        if (!options?.silent) toast.success("Discount created");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: any) => {
                        if (!options?.silent) toast.error("Failed to create discount", { description: err.message || String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Update discount
        updateDiscount: (options?: UseAPICallerOptions) =>
            useMutation<any, any, any>(
                trpc.discounts.updateDiscount.mutationOptions({
                    onSuccess: (data: any) => {
                        if (!options?.silent) toast.success("Discount updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: any) => {
                        if (!options?.silent) toast.error("Failed to update discount", { description: err.message || String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Toggle discount status
        toggleDiscount: (options?: UseAPICallerOptions) =>
            useMutation<any, any, { id: string; isActive: boolean }>(
                trpc.discounts.toggleDiscount.mutationOptions({
                    onSuccess: (data: any) => {
                        if (!options?.silent) toast.success("Discount status updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: any) => {
                        if (!options?.silent) toast.error("Failed to update status", { description: err.message || String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Delete discount
        deleteDiscount: (options?: UseAPICallerOptions) =>
            useMutation<any, any, { id: string }>(
                trpc.discounts.deleteDiscount.mutationOptions({
                    onSuccess: (data: any) => {
                        if (!options?.silent) toast.success("Discount deleted");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: any) => {
                        if (!options?.silent) toast.error("Failed to delete discount", { description: err.message || String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Get calculated cart discount
        useGetCalculatedCartDiscount: (input: { vendorId: string; subTotal: number }) =>
            useQuery(trpc.discounts.getCalculatedCartDiscount.queryOptions(input, { enabled: !!input.vendorId && input.subTotal > 0 })),
    };
}
