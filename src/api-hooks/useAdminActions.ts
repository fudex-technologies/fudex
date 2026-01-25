"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";

export function useAdminActions() {
    const trpc = useTRPC();

    return {
        // Areas
        useListAreas: (input?: { take?: number; skip?: number; state?: string }) =>
            useQuery(trpc.admin.listAreas.queryOptions(input ?? {})),
        useGetAreaById: (input: { id: string }) =>
            useQuery(trpc.admin.getAreaById.queryOptions(input, { enabled: !!input.id })),
        createArea: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.createArea.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Area created");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to create area", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        updateArea: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.updateArea.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Area updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update area", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        deleteArea: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.deleteArea.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Area deleted");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to delete area", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Delivery Fee Rules
        useListDeliveryFeeRules: (input: { areaId: string }) =>
            useQuery(trpc.admin.listDeliveryFeeRules.queryOptions(input, { enabled: !!input.areaId })),
        createDeliveryFeeRule: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.createDeliveryFeeRule.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Delivery fee rule created");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to create delivery fee rule", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        updateDeliveryFeeRule: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.updateDeliveryFeeRule.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Delivery fee rule updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update delivery fee rule", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        deleteDeliveryFeeRule: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.deleteDeliveryFeeRule.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Delivery fee rule deleted");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to delete delivery fee rule", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Platform Settings
        useGetPlatformSetting: (input: { key: string }) =>
            useQuery(trpc.admin.getPlatformSetting.queryOptions(input)),
        useListPlatformSettings: () =>
            useQuery(trpc.admin.listPlatformSettings.queryOptions(undefined)),
        setPlatformSetting: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.setPlatformSetting.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Setting updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update setting", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
        deletePlatformSetting: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.deletePlatformSetting.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Setting deleted");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to delete setting", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Assign vendor role and create vendor profile by email
        assignVendorRoleAndCreateProfile: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.assignVendorRoleAndCreateProfile.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Vendor role assigned and profile created");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to assign vendor role", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Vendors
        useInfiniteListVendors: (input: { limit?: number; q?: string } = {}) =>
            useInfiniteQuery(
                trpc.admin.listVendorsInfinite.infiniteQueryOptions(
                    { ...input },
                    {
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        updateVendorByAdmin: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.updateVendorByAdmin.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Vendor updated successfully");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update vendor", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        // Menu Management
        useListVendorCategories: (input: { vendorId: string }) =>
            useQuery(trpc.admin.listVendorCategories.queryOptions(input, { enabled: !!input.vendorId })),

        useInfiniteListVendorProducts: (input: { vendorId: string; limit?: number } = { vendorId: "" }) =>
            useInfiniteQuery(
                trpc.admin.listVendorProducts.infiniteQueryOptions(
                    { ...input },
                    {
                        enabled: !!input.vendorId,
                        getNextPageParam: (lastPage: any) => lastPage.nextCursor,
                    }
                )
            ),

        updateProductItemByAdmin: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.updateProductItemByAdmin.mutationOptions({
                    onSuccess: (data) => {
                        if (!options?.silent) toast.success("Product item updated");
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update product item", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        toggleProductItemCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.toggleProductItemCategory.mutationOptions({
                    onSuccess: (data) => {
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update category", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),

        toggleVendorCategory: (options?: UseAPICallerOptions) =>
            useMutation(
                trpc.admin.toggleVendorCategory.mutationOptions({
                    onSuccess: (data) => {
                        options?.onSuccess?.(data);
                    },
                    onError: (err: unknown) => {
                        if (!options?.silent) toast.error("Failed to update vendor category", { description: err instanceof Error ? err.message : String(err) });
                        options?.onError?.(err);
                    },
                    retry: false,
                })
            ),
    };
}

