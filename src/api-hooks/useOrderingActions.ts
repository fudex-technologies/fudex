"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

// Hooks for vendor/product and ordering flows. Each hook returns a react-query mutation
// or uses the trpc useQuery hook for reads. Callers may pass `onSuccess`/`onError` via
// the `options` argument to customize behavior.


export function useOrderingActions() {
    const trpc = useTRPC();

    const createOrder = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.orders.createOrder.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Order created");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to create order", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const createPayment = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.payments.createPayment.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Payment created");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to create payment", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const verifyPayment = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.payments.verifyPayment.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Payment verified");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Payment verification failed", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    return {
        createOrder,
        createPayment,
        verifyPayment,

        // queries
        useGetOrder: (input: { id: string }) =>
            useQuery(trpc.orders.getOrder.queryOptions({ ...input })),
        useGetOrderPacks: (input: { id: string }) =>
            useQuery(trpc.orders.getOrderPacks.queryOptions({ ...input })),
        useListMyOrders: (input?: { take?: number; skip?: number }) =>
            useQuery(trpc.orders.listMyOrders.queryOptions(input ?? {})),
    };
}
