"use client";

import { PAGES_DATA } from "@/data/pagesData";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseAPICallerOptions } from "./api-hook-types";
import { localStorageStrings } from "@/constants/localStorageStrings";
import { signIn, signUp } from "@/lib/auth-client";


export function useAuthActions() {
    const router = useRouter();
    const trpc = useTRPC();


    const login = (options?: UseAPICallerOptions & { password: string, redirect?: string, rememberMe?: boolean }) => {
        return useMutation(
            trpc.phoneAuth.loginWithPhoneResolver.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.password) {
                        toast.error("Please provide your password!")
                        return;
                    }
                    const result = await signIn.email({
                        email: data.email,
                        password: options.password,
                        rememberMe: options.rememberMe,
                    });

                    if (!result?.data) {
                        if (!options?.silent) {
                            toast.error("Login failed", {
                                description:
                                    result?.error?.message || "Invalid phone or password",
                            });
                        }
                        options?.onError?.(result?.error);
                        return;
                    }

                    if (!options?.silent) {
                        toast.success("Logged in successfully");
                    }
                    options?.onSuccess?.(data);
                    router.replace(options?.redirect || PAGES_DATA.home_page);
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
                    // if (session) {
                    // user is signed in via Google — attach the verified phone
                    //     attachPhoneMut.mutate({ token: data?.token });
                    //     return;
                    // }
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


    const setPasswordAndCompleteSignUp = (options?: UseAPICallerOptions & { password: string, redirectTo: string, token: string }) => {
        return useMutation(
            trpc.phoneAuth.completeSignupPrepare.mutationOptions({
                onSuccess: async (data) => {
                    if (!options?.password) {
                        toast.error("Please provide your password!")
                        return;
                    }
                    await signUp.email({
                        email: data.email,
                        name: data.name,
                        password: options.password,
                    });

                    // 2️⃣ Attach verified phone (now authenticated)
                    await attachPhoneMut.mutateAsync({ token: options.token });

                    if (!options?.silent) toast.success("Account created successfully");
                    options?.onSuccess?.(data);
                    router.replace(options?.redirectTo || PAGES_DATA.home_page)
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
    // Protected OTP actions
    const requestProfileOtp = (
        { onSuccess, onError }: { onSuccess?: () => void; onError?: (err: unknown) => void } = {}
    ) => {
        const mutation = useMutation(
            trpc.phoneAuth.requestProfileOtp.mutationOptions({
                onSuccess: () => {
                    toast.success('OTP sent');
                    onSuccess?.();
                },
                onError: (err) => {
                    toast.error(err.message || 'Failed to send OTP');
                    onError?.(err);
                }
            })
        );
        return mutation;
    };

    const verifyProfileOtp = (
        { onSuccess, onError }: { onSuccess?: () => void; onError?: (err: unknown) => void } = {}
    ) => {
        const mutation = useMutation(
            trpc.phoneAuth.verifyProfileOtp.mutationOptions({
                onSuccess: () => {
                    toast.success('Phone verified successfully');
                    // Refresh session/profile
                    router.refresh();
                    onSuccess?.();
                },
                onError: (err) => {
                    toast.error(err.message || 'Verification failed');
                    onError?.(err);
                }
            })
        );
        return mutation;
    };

    // for users that login through google
    const attachPhoneMut = useMutation(
        trpc.phoneAuth.attachVerifiedPhone.mutationOptions({
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
        setPasswordAndCompleteSignUp,
        requestProfileOtp,
        verifyProfileOtp
    }
}