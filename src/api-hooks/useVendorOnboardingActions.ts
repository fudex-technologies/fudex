"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { localStorageStrings } from "@/constants/localStorageStrings";
import { signUp } from "@/lib/auth-client";
import { normalizePhoneNumber } from "@/lib/commonFunctions";

export function useVendorOnboardingActions() {
    const trpc = useTRPC();
    const queryClient = useQueryClient();

    // Request email verification OTP
    const requestEmailVerification = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.phoneAuth.requestEmailVerificationOtp.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success("Verification code sent to your email");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("Failed to send verification code", {
                            description:
                                err instanceof Error ? err.message : "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    };

    // Verify email OTP
    const verifyEmailOtp = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.phoneAuth.verifyEmailOtp.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success("Email verified successfully");

                    // Store verification token
                    localStorage.setItem(
                        localStorageStrings.vendorOnboardingEmailVerificationToken,
                        data.token
                    );

                    // Store if user exists
                    localStorage.setItem(
                        localStorageStrings.vendorOnboardingIsExistingUser,
                        data.isExistingUser.toString()
                    );

                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("Email verification failed", {
                            description:
                                err instanceof Error ? err.message : "Invalid code",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    };

    // Set password and sign up for new users (Step 4)
    const setPasswordAndSignUp = (
        options?: UseAPICallerOptions & {
            password: string;
            email: string;
            firstName: string;
            lastName: string;
        }
    ) => {
        return useMutation({
            mutationFn: async () => {
                if (!options?.password || !options?.email || !options?.firstName || !options?.lastName) {
                    throw new Error("Missing required fields");
                }

                // Create user account via signUp
                const name = `${options.firstName} ${options.lastName}`;
                await signUp.email({
                    email: options.email,
                    name,
                    password: options.password,
                });
                return { success: true };
            },
            onSuccess: (data) => {
                if (!options?.silent) toast.success("Account created successfully");
                options?.onSuccess?.(data);
            },
            onError: (err: unknown) => {
                if (!options?.silent)
                    toast.error("Failed to create account", {
                        description: err instanceof Error ? err.message : "Something went wrong",
                    });
                options?.onError?.(err);
            },
            retry: false,
        });
    };

    // Finalize vendor onboarding (Step 5 - Terms page)
    const finalizeVendorOnboarding = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.vendors.createVendorAccount.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success("Vendor account activated!");

                    // Invalidate onboarding progress query
                    queryClient.invalidateQueries({
                        queryKey: [['vendors', 'getVendorOnboardingProgress']]
                    });

                    // Clear onboarding data
                    localStorage.removeItem(localStorageStrings.vendorOnboardinPersonalDetailsstring);
                    localStorage.removeItem(localStorageStrings.vendorOnboardingEmailVerificationToken);
                    localStorage.removeItem(localStorageStrings.vendorOnboardingIsExistingUser);
                    localStorage.removeItem(localStorageStrings.vendorOnboardingLocationData);

                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("Failed to activate vendor account", {
                            description:
                                err instanceof Error ? err.message : "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    };

    return {
        requestEmailVerification,
        verifyEmailOtp,
        setPasswordAndSignUp,
        finalizeVendorOnboarding,
    };
}
