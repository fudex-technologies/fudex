"use client";

import { useTRPC } from "@/trpc/client";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

export function usePayoutActions() {
    const trpc = useTRPC();

    return {
        // SUPER_ADMIN queries
        useGetPendingPayouts: (enabled: boolean = true) =>
            useQuery(trpc.payouts.getPendingPayouts.queryOptions(undefined, { enabled })),

        // SUPER_ADMIN mutations
        initiateVendorTransfers: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.payouts.initiateVendorTransfers.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success(`Successfully initiated ${data.count} transfers`);
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to initiate transfers", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        markPayoutAsPaidManually: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.payouts.markPayoutAsPaidManually.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Payout marked as paid manually");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to mark payout as paid", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),


        // SUPER_ADMIN queries
        useGetPayoutStats: (enabled: boolean = true) =>
            useQuery(trpc.payouts.getPayoutStats.queryOptions(undefined, { enabled })),

        useInfiniteGetAllPayouts: (input: { limit?: number; status?: any; vendorId?: string; search?: string } = {}) =>
            useInfiniteQuery(
                trpc.payouts.getAllPayoutsInfinite.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage) => lastPage.nextCursor,
                    }
                )
            ),

        // VENDOR queries
        useGetMyPayoutHistory: (enabled: boolean = true) =>
            useQuery(trpc.payouts.getMyPayoutHistory.queryOptions(undefined, { enabled })),

        useGetMyEarningsSummary: (enabled: boolean = true) =>
            useQuery(trpc.payouts.getMyEarningsSummary.queryOptions(undefined, { enabled })),

        useGetPayoutDetails: (input: { payoutId: string }, options?: { enabled?: boolean }) =>
            useQuery(trpc.payouts.getPayoutDetails.queryOptions(input, { enabled: options?.enabled ?? !!input.payoutId })),
    };
}
