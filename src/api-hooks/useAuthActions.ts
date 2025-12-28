"use client";

import { PAGES_DATA } from "@/data/pagesData";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { localStorageStrings } from "@/constants/localStorageStrings";


export function useAuthActions() {
    const router = useRouter();
    const trpc = useTRPC();

    const login = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.phoneAuth.loginWithPhone.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success('Logged in successfully');
                    // navigate to home/profile
                    router.replace(PAGES_DATA.home_page);
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error('Login failed', {
                            description:
                                err instanceof Error ? err.message : 'Something went wrong',
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        );
    }

    const requestPhoneOtp = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.phoneAuth.requestOtp.mutationOptions({
                onSuccess: async (data) => {
                    router.replace(PAGES_DATA.onboarding_verify_number_page);
                    if (!options?.silent) toast.success("OTP sent");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    console.log(err);

                    if (!options?.silent)
                        toast.error("OTP Failed to send", {
                            description:
                                err instanceof Error ? err.message : "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            }),
        )
    };

    const verifyPhoneOtp = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.phoneAuth.verifyOtp.mutationOptions({
                onSuccess: async (data) => {
                    localStorage.setItem(
                        localStorageStrings.onboardingVerificationToken,
                        data?.token
                    );
                    router.replace(PAGES_DATA.onboarding_verify_number_page);
                    if (!options?.silent) toast.success("OTP Verified successfully");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("OTP verification failed", {
                            description:
                                err instanceof Error ? err.message : "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            }),
        )
    }


    const setPasswordAndCompleteSignUp = (options?: UseAPICallerOptions) => {
        return useMutation(
            trpc.phoneAuth.completeSignup.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.silent) toast.success("Account created successfully");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
                    if (!options?.silent)
                        toast.error("Account creation failed", {
                            description:
                                err instanceof Error ? err.message : "Something went wrong",
                        });
                    options?.onError?.(err);
                },
                retry: false,
            })
        )
    }

    return {
        login,
        requestPhoneOtp,
        verifyPhoneOtp,
        setPasswordAndCompleteSignUp
    }
}