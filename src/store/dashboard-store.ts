import { create } from "zustand";
import { combine, persist } from 'zustand/middleware'


export const useDashboardStore = create(
    persist(
        combine(
            {
                hasSeenOnboarding: false,
                showBalance: true,
            },
            (set) => ({
                setHasSeenOnboarding: (hasSeen: boolean) => set({ hasSeenOnboarding: hasSeen }),
                setShowBalance: (show: boolean) => set({ showBalance: show }),
            })
        ),
        {
            name: 'dashboard-store',
            partialize: (state) => ({
                hasSeenOnboarding: state.hasSeenOnboarding,
                showBalance: state.showBalance,
            }),
        }
    )
);
