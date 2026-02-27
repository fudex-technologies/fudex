"use client"

import { useSession } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { UseAPICallerOptions } from "./api-hook-types";
import { toast } from "sonner";

export function useProfileActions() {
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

    const addAddress = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.users.createAddress.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Address Added!");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to add address", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const updateAddress = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.users.updateAddress.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Address updated!");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to update address", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    const deleteAddress = (options?: UseAPICallerOptions) =>
        useMutation(
            trpc.users.deleteAddress.mutationOptions({
                onSuccess: (data) => {
                    if (!options?.silent) toast.success("Address deleted!");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent) toast.error("Failed to delete address", { description: err instanceof Error ? err.message : String(err) });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );

    return {
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,

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
        ),
        isUserAnAdmin: () => useQuery(
            trpc.users.checkAdminRole.queryOptions(undefined, {
                enabled: !!session,
            }),
        ),
        isUserAnOperator: () => useQuery(
            trpc.operators.checkOperatorRole.queryOptions(undefined, {
                enabled: !!session,
            }),
        ),
        getAddresses: () => useQuery(
            trpc.users.listAddresses.queryOptions(undefined, {
                enabled: !!session,
            })
        ),
        getAddress: (id: string) => useQuery(
            trpc.users.getAddress.queryOptions({ id }, {
                enabled: !!session && !!id,
            })
        ),
        getAllAreasInEkiti: () => useQuery(
            trpc.users.listAreas.queryOptions({ state: "ekiti" })
        ),

        // Favorite vendors
        toggleFavoriteVendor: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.users.toggleFavoriteVendor.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) {
                            toast.success(data.favorited ? "Added to favorites" : "Removed from favorites");
                        }
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update favorites", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        isVendorFavorited: (vendorId: string) => useQuery(
            trpc.users.isVendorFavorited.queryOptions({ vendorId }, {
                enabled: !!session && !!vendorId,
            })
        ),
        getMyFavoriteVendors: (input?: { take?: number; skip?: number }) => useQuery(
            trpc.users.getMyFavoriteVendors.queryOptions(input ?? {}, {
                enabled: !!session,
            })
        ),
        getReferralStats: () => useQuery(
            trpc.users.getReferralStats.queryOptions(undefined, {
                enabled: !!session,
            })
        ),
        generateReferralCode: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.users.generateReferralCode.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) {
                            if (data.isNewCode) {
                                toast.success("Referral code generated successfully!");
                            } else {
                                toast.info("You already have a referral code");
                            }
                        }
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to generate code", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        getMonthlyLeaderboard: () => useQuery(
            trpc.users.getMonthlyLeaderboard.queryOptions(undefined, {
                enabled: !!session,
            })
        ),
    }
}