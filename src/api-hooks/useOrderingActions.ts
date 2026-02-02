"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { OrderStatus } from "@prisma/client";
import { useSession } from "@/lib/auth-client";


export function useOrderingActions() {
    const trpc = useTRPC();
    const { data: session } = useSession()

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

    const confirmOrderDelivery = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.orders.confirmOrderDelivery.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Order delivery confirmed");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to confirm order delivery", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );


    const useGetNumberOfMyDeliveredOrders = () => {
        const { data } = useQuery(trpc.orders.listMyOrders.queryOptions({ status: ["DELIVERED"] }))
        return data?.length || 0
    }
    const useGetNumberOfMyOngoingOrders = () => {
        const { data } = useQuery(trpc.orders.listMyOrders.queryOptions(
            { status: ["PENDING", "PREPARING", "PAID", "ASSIGNED", "ACCEPTED", "READY", "OUT_FOR_DELIVERY"] },
            {
                // Mark data as stale immediately so it refetches on mount
                staleTime: 0,
                // Refetch when component mounts or window regains focus
                refetchOnMount: 'always',
                refetchOnWindowFocus: true,
            }
        ))
        return data?.length || 0
    }

    return {
        createOrder,
        createPayment,
        verifyPayment,
        confirmOrderDelivery,

        // queries
        useGetOrder: (input: { id: string }) =>
            useQuery(trpc.orders.getOrder.queryOptions({ ...input })),

        useGetOrderPacks: (input: { id: string }) =>
            useQuery(trpc.orders.getOrderPacks.queryOptions({ ...input })),

        useListMyOrders: (input?: { take?: number; skip?: number, status?: OrderStatus[] }) =>
            useQuery(trpc.orders.listMyOrders.queryOptions(
                input ?? {},
                { enabled: !!session }
            )),

        useListOngoingOrders: (input?: { take?: number; skip?: number, status?: OrderStatus }) =>
            useQuery(trpc.orders.listMyOrders.queryOptions({
                ...input, status: ["PENDING", "PREPARING", "PAID", "ASSIGNED", "ACCEPTED", "READY", "OUT_FOR_DELIVERY"]
            })),

        useListDeliveredOrders: (input?: { take?: number; skip?: number, status?: OrderStatus }) =>
            useQuery(trpc.orders.listMyOrders.queryOptions({
                ...input, status: ["DELIVERED"]
            })),

        useInfiniteListMyOrders: (input?: { limit?: number; status?: OrderStatus }) =>
            useInfiniteQuery(
                trpc.orders.listMyOrdersInfinite.infiniteQueryOptions(
                    {
                        limit: input?.limit ?? 20,
                        status: input?.status,
                    },
                    {
                        getNextPageParam: (lastPage) => lastPage.nextCursor,
                        initialCursor: 0,
                    }
                )
            ),
        useGetPaymentStatus: (input: { orderId: string }) =>
            useQuery(trpc.payments.getPaymentStatus.queryOptions({ ...input })),
        useGetNumberOfMyDeliveredOrders,
        useGetNumberOfMyOngoingOrders,
    };
}
