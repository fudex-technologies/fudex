import { create } from "zustand";
import { persist } from "zustand/middleware";

// Cart item structure matching the order creation schema
export interface CartAddon {
	addonProductItemId: string;
	quantity: number;
}

export interface CartPack {
	id: string; // unique pack ID for editing
	productItemId: string; // main item
	quantity: number; // quantity of this pack
	addons?: CartAddon[]; // optional addons
	groupKey?: string; // for grouping similar packs
}

export interface CartState {
	packs: CartPack[];
	vendorId: string | null; // all items must be from same vendor
	addPack: (pack: Omit<CartPack, "id">, vendorId: string) => void;
	updatePack: (packId: string, updates: Partial<CartPack>) => void;
	removePack: (packId: string) => void;
	clearCart: () => void;
	getTotalPacks: () => number;
}

const CART_STORAGE_KEY = "fudex:cart";

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			packs: [],
			vendorId: null,

			addPack: (pack, vendorId) => {
				const state = get();
				const newPack: CartPack = {
					...pack,
					id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
				};

				// If cart is empty, set vendorId
				// If cart has items, ensure same vendor
				if (state.packs.length === 0) {
					set({ packs: [newPack], vendorId });
				} else {
					// Validate same vendor (will be checked on order creation)
					if (state.vendorId !== vendorId) {
						throw new Error('All items must be from the same vendor');
					}
					set((state) => ({
						packs: [...state.packs, newPack],
					}));
				}
			},

			updatePack: (packId, updates) => {
				set((state) => ({
					packs: state.packs.map((pack) =>
						pack.id === packId ? { ...pack, ...updates } : pack
					),
				}));
			},

			removePack: (packId) => {
				set((state) => {
					const newPacks = state.packs.filter((pack) => pack.id !== packId);
					return {
						packs: newPacks,
						vendorId: newPacks.length === 0 ? null : state.vendorId,
					};
				});
			},

			clearCart: () => {
				set({ packs: [], vendorId: null });
			},

			getTotalPacks: () => {
				return get().packs.length;
			},
		}),
		{
			name: CART_STORAGE_KEY,
		}
	)
);

