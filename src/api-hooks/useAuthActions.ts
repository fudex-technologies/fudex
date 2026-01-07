"use client";

import { PAGES_DATA } from "@/data/pagesData";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { localStorageStrings } from "@/constants/localStorageStrings";
import { useSession } from "@/lib/auth-client";


export function useAuthActions() {
    const router = useRouter();
    const trpc = useTRPC();
    const { data: session } = useSession();


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
                    if (!options?.silent) toast.success("OTP sent");
                    options?.onSuccess?.(data);
                },
                onError: (err: unknown) => {
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
                    // data.token is the verification token
                    if (session) {
                        // user is signed in via Google — attach the verified phone
                        attachPhoneMut.mutate({ token: data?.token });
                        return;
                    }
                    localStorage.setItem(
                        localStorageStrings.onboardingVerificationToken,
                        data?.token
                    );
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

    // for users that login through google
    const attachPhoneMut = useMutation(
        trpc.phoneAuth.attachVerifiedPhone.mutationOptions({
            onSuccess: () => {
                toast.success('Phone attached');
                router.replace(PAGES_DATA.home_page);
            },
            onError: (err: unknown) => {
                toast.error('Failed to attach phone', {
                    description:
                        err instanceof Error
                            ? err.message
                            : 'Something went wrong',
                });
            },
            retry: false,
        })
    );

    return {
        login,
        requestPhoneOtp,
        verifyPhoneOtp,
        setPasswordAndCompleteSignUp
    }
}