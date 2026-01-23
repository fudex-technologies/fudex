"use client";

import { PAGES_DATA } from "@/data/pagesData";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { localStorageStrings } from "@/constants/localStorageStrings";
import { signIn, signUp } from "@/lib/auth-client";
import { normalizePhoneNumber } from "@/lib/commonFunctions";

export function useVendorOnboardingActions() {
    const trpc = useTRPC();

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

    // Create vendor account
    const createVendorAccount = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.vendors.createVendorAccount.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success("Vendor account created successfully");

                    // Store vendor info
                    localStorage.setItem(
                        localStorageStrings.vendorOnboardingUserLinked,
                        "true"
                    );

                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("Failed to create vendor account", {
                            description:
                                err instanceof Error ? err.message : "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    };

    // Set password and complete vendor signup for new users
    const setPasswordAndCompleteVendorSignup = (
        options?: UseAPICallerOptions & {
            password: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string;
            businessName: string;
            businessDescription: string;
            verificationToken: string;
        }
    ) => {
        // Create a mutation for vendor account creation that can be called with mutateAsync
        const createVendorMutation = useMutation(
            trpc.vendors.createVendorAccount.mutationOptions()
        );

        return useMutation({
            mutationFn: async () => {
                if (!options?.password || !options?.email || !options?.firstName || !options?.lastName) {
                    throw new Error("Missing required fields");
                }

                // Get location data from localStorage
                const locationDataStr = localStorage.getItem(localStorageStrings.vendorOnboardingLocationData);
                const locationData = locationDataStr ? JSON.parse(locationDataStr) : {};

                // 1. Create user account via signUp
                const name = `${options.firstName} ${options.lastName}`;
                await signUp.email({
                    email: options.email,
                    name,
                    password: options.password,
                });

                // 2. Wait a moment for session to be established
                await new Promise(resolve => setTimeout(resolve, 500));

                // 3. Create vendor account now that user is authenticated
                const vendorResult = await createVendorMutation.mutateAsync({
                    email: options.email,
                    phone: normalizePhoneNumber(options.phone),
                    firstName: options.firstName,
                    lastName: options.lastName,
                    businessName: options.businessName,
                    businessDescription: options.businessDescription,
                    verificationToken: options.verificationToken,
                    address: locationData.businessAddress,
                    areaId: locationData.areaId,
                });

                return vendorResult;
            },
            onSuccess: (data) => {
                if (!options?.silent) toast.success("Account created successfully");

                // Clear onboarding data
                localStorage.removeItem(localStorageStrings.vendorOnboardinPersonalDetailsstring);
                localStorage.removeItem(localStorageStrings.vendorOnboardingEmailVerificationToken);
                localStorage.removeItem(localStorageStrings.vendorOnboardingLocationData);

                options?.onSuccess?.(data);
            },
            onError: (err: unknown) => {
                if (!options?.silent)
                    toast.error("Failed to complete registration", {
                        description: err instanceof Error ? err.message : "Something went wrong",
                    });
                options?.onError?.(err);
            },
            retry: false,
        });
    };

    // Link existing user and create vendor account
    const linkExistingUserAndCreateVendor = (
        options?: UseAPICallerOptions & {
            userId: string;
            email: string;
            phone: string;
            firstName: string;
            lastName: string;
            businessName: string;
            businessDescription: string;
            verificationToken: string;
        }
    ) => {
        return useMutation(
            trpc.vendors.createVendorAccount.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success("Vendor account linked successfully");

                    // Get location data from localStorage
                    const locationDataStr = localStorage.getItem(localStorageStrings.vendorOnboardingLocationData);
                    
                    // Clear onboarding data
                    localStorage.removeItem(localStorageStrings.vendorOnboardinPersonalDetailsstring);
                    localStorage.removeItem(localStorageStrings.vendorOnboardingEmailVerificationToken);
                    localStorage.removeItem(localStorageStrings.vendorOnboardingIsExistingUser);
                    localStorage.removeItem(localStorageStrings.vendorOnboardingLocationData);

                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("Failed to link vendor account", {
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
        createVendorAccount,
        setPasswordAndCompleteVendorSignup,
        linkExistingUserAndCreateVendor,
    };
}
