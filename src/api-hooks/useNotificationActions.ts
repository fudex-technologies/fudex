"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

export function useNotificationActions() {
    const trpc = useTRPC();

    const subscribeToPush = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.notifications.subscribe.mutationOptions({
                onSuccess: async (data: any) => {
                    if (!options?.silent) toast.success("Notifications enabled!");
                    options?.onSuccess?.(data);
                },
                onError: (err: any) => {
                    if (!options?.silent)
                        toast.error("Failed to enable notifications", {
                            description: err.message || "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    };

    const unsubscribeFromPush = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.notifications.unsubscribe.mutationOptions({
                onSuccess: async (data: any) => {
                    if (!options?.silent) toast.success("Notifications disabled");
                    options?.onSuccess?.(data);
                },
                onError: (err: any) => {
                    if (!options?.silent)
                        toast.error("Failed to disable notifications", {
                            description: err.message || "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    };

    return {
        subscribeToPush,
        unsubscribeFromPush,
    };
}
