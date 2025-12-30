import { create } from "zustand";
import { combine, persist } from 'zustand/middleware'


export const useDashboardStore = create(
    persist(
        combine(
            {
                hasSeenOnboarding: false,
            },
            (set) => ({
                setHasSeenOnboarding: (hasSeen: boolean) => set({ hasSeenOnboarding: hasSeen }),
            })
        ),
        {
            name: 'dashboard-store',
            partialize: (state) => ({
                hasSeenOnboarding: state.hasSeenOnboarding,
            }),
        }
    )
);
