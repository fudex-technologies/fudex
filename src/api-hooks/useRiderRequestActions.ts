"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { SettlementStatus } from "@prisma/client";

export function useRiderRequestActions() {
    const trpc = useTRPC();

    const requestRider = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.riderRequests.requestRider.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Rider request submitted");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to submit rider request", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const notifySettlementPayment = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.riderRequests.notifySettlementPayment.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Payment notification sent");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to send payment notification", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const approveSettlements = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.riderRequests.approveSettlements.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Settlements approved");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to approve settlements", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    return {
        requestRider,
        notifySettlementPayment,
        approveSettlements,

        // queries
        useListMyRiderRequests: (input?: { settlementStatus?: SettlementStatus[] }) =>
            useQuery(trpc.riderRequests.listMyRiderRequests.queryOptions(
                { ...input },
                {
                    // Mark data as stale immediately so it refetches on mount
                    staleTime: 0,
                    // Refetch when component mounts or window regains focus
                    refetchOnMount: 'always',
                    refetchOnWindowFocus: true,
                }
            )),

        useListAdminSettlements: (input?: { settlementStatus?: SettlementStatus }) =>
            useQuery(trpc.riderRequests.listAdminSettlements.queryOptions(
                { ...input },
                {
                    // Mark data as stale immediately so it refetches on mount
                    staleTime: 0,
                    // Refetch when component mounts or window regains focus
                    refetchOnMount: 'always',
                    refetchOnWindowFocus: true,
                }
            )),
    };
}
