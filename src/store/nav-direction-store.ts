import { create } from "zustand";

type NavDirection = "forward" | "back";

type NavState = {
    direction: NavDirection;
    setDirection: (dir: NavDirection) => void;
};

export const useNavDirection = create<NavState>((set) => ({
    direction: "forward",
    setDirection: (dir) => set({ direction: dir }),
}));
