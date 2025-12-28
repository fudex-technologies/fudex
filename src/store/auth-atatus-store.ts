import { create } from "zustand";

type AuthType = "account-creation" | "password-reset" | undefined;
type AuthStatus = "success" | "failure" | "pending" | undefined;
type AuthStatusStore = {
    type: AuthType;
    status: AuthStatus;
    setAuthStatus: ({ type, status }: { type?: AuthType, status?: AuthStatus }) => void
};


export const useAuthStatusStore = create<AuthStatusStore>((set) => ({
    type: undefined,
    status: undefined,
    setAuthStatus: ({ type, status }) => set({ type, status })
}))
