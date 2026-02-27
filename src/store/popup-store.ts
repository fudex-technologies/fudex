import { create } from 'zustand';

interface PopupState {
    queue: string[];
    activePopup: string | null;
    enqueuePopup: (id: string) => void;
    dequeuePopup: (id: string) => void;
}

export const usePopupStore = create<PopupState>((set) => ({
    queue: [],
    activePopup: null,
    enqueuePopup: (id) =>
        set((state) => {
            if (state.queue.includes(id) || state.activePopup === id) {
                return state; // Already in queue or currently active
            }
            const newQueue = [...state.queue, id];
            return {
                queue: newQueue,
                activePopup: state.activePopup ? state.activePopup : newQueue[0]
            };
        }),
    dequeuePopup: (id) =>
        set((state) => {
            if (state.activePopup === id) {
                const newQueue = state.queue.filter((item) => item !== id);
                return {
                    queue: newQueue,
                    activePopup: newQueue.length > 0 ? newQueue[0] : null
                };
            }
            return {
                queue: state.queue.filter((item) => item !== id)
            };
        }),
}));
