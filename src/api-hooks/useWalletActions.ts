"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

export function useWalletActions() {
    const trpc = useTRPC();

    return {
        useGetBalance: (options?: { enabled?: boolean }) =>
            useQuery(
                trpc.wallet.getBalance.queryOptions(undefined, {
                    enabled: options?.enabled ?? true,
                })
            ),

        useGetTransactions: (
            input?: {
                limit?: number;
                cursor?: string;
                sourceType?: any;
            },
            options?: { enabled?: boolean }
        ) =>
            useQuery(
                trpc.wallet.getTransactions.queryOptions(input ?? {}, {
                    enabled: options?.enabled ?? true,
                })
            ),

        useInfiniteTransactions: (
            input?: {
                limit?: number;
                sourceType?: any;
            },
            options?: { enabled?: boolean }
        ) =>
            useInfiniteQuery(
                trpc.wallet.getTransactions.infiniteQueryOptions(
                    {
                        limit: input?.limit ?? 20,
                        sourceType: input?.sourceType,
                    },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                        enabled: options?.enabled ?? true,
                    }
                )
            ),

        initializeFunding: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.wallet.initializeFunding.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Funding initialized");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to initialize funding", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        useVerifyFunding: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.wallet.verifyFunding.mutationOptions({
                    onSuccess: (data) => {
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent)
                            toast.error("Failed to verify funding", {
                                description: err instanceof Error ? err.message : String(err),
                            });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
    };
}
