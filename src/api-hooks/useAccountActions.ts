"use client"

import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UseAPICallerOptions } from "./api-hook-types";
import { toast } from "sonner";

export function usePRofileActions() {
    const { data: session } = useSession();
    const trpc = useTRPC();

    const updateProfile = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.users.updateProfile.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Profile updated");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to update profile", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    return {
        updateProfile,

        // helpers
        getProfile: () => useQuery(
            trpc.users.profile.queryOptions(undefined, {
                enabled: !!session,
            }),
        ),
        isUserAVendor: () => useQuery(
            trpc.users.checkVendorRole.queryOptions(undefined, {
                enabled: !!session,
            }),
        )
    }
}