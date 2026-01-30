import { create } from "zustand";
import { persist } from "zustand/middleware";

// Cart item structure matching the order creation schema
export interface CartAddon {
	addonProductItemId: string;
	quantity: number;
}

export interface CartPack {
	id: string;
	productItemId: string;
	quantity: number;  // For PER_UNIT: this is the unit quantity (e.g., 4 scoops)
	numberOfPacks: number; // NEW: How many packs of this config (e.g., 2 packs of 4 scoops)
	addons?: CartAddon[];
	groupKey?: string;
}

export interface CartVendor {
	vendorId: string;
	packs: CartPack[];
}

export interface CartState {
	vendors: Record<string, CartVendor>;
	isCartEmpty: () => boolean;
	isVendorCartEmpty: (vendorId: string) => boolean;
	addPack: (vendorId: string, pack: Omit<CartPack, "id">) => void;
	updatePack: (
		vendorId: string,
		packId: string,
		updates: Partial<CartPack>
	) => void;
	removePack: (vendorId: string, packId: string) => void;

	clearVendor: (vendorId: string) => void;
	clearCart: () => void;

	getTotalPacks: () => number;
	getTotalVendors: () => number;
	getVendorPacks: (vendorId: string) => CartPack[];
	getVendorPackCount: (vendorId: string) => number;
	getVendorsCount: () => number;
}

const CART_STORAGE_KEY = "fudex:cart";

export const useCartStore = create<CartState>()(
	persist(
		(set, get) => ({
			vendors: {},
			isCartEmpty: () => {
				return Object.values(get().vendors).every(
					(v) => v.packs.length === 0
				);
			},
			isVendorCartEmpty: (vendorId) => {
				if (!get().vendors[vendorId]) return true;
				return get().vendors[vendorId]?.packs.length === 0;
			},
			addPack: (vendorId, pack) => {
				const newPack: CartPack = {
					...pack,
					numberOfPacks: pack.numberOfPacks || 1,
					id: `${Date.now()}-${Math.random()
						.toString(36)
						.slice(2)}`,
				};

				set((state) => {
					const vendor = state.vendors[vendorId];

					if (!vendor) {
						return {
							vendors: {
								...state.vendors,
								[vendorId]: {
									vendorId,
									packs: [newPack],
								},
							},
						};
					}

					return {
						vendors: {
							...state.vendors,
							[vendorId]: {
								...vendor,
								packs: [...vendor.packs, newPack],
							},
						},
					};
				});
			},

			updatePack: (vendorId, packId, updates) => {
				set((state) => {
					const vendor = state.vendors[vendorId];
					if (!vendor) return state;

					return {
						vendors: {
							...state.vendors,
							[vendorId]: {
								...vendor,
								packs: vendor.packs.map((p) =>
									p.id === packId ? { ...p, ...updates } : p
								),
							},
						},
					};
				});
			},

			removePack: (vendorId, packId) => {
				set((state) => {
					const vendor = state.vendors[vendorId];
					if (!vendor) return state;

					const packs = vendor.packs.filter(
						(p) => p.id !== packId
					);

					if (packs.length === 0) {
						const { [vendorId]: _, ...rest } =
							state.vendors;
						return { vendors: rest };
					}

					return {
						vendors: {
							...state.vendors,
							[vendorId]: { ...vendor, packs },
						},
					};
				});
			},

			clearVendor: (vendorId) => {
				set((state) => {
					const { [vendorId]: _, ...rest } =
						state.vendors;
					return { vendors: rest };
				});
			},

			clearCart: () => {
				set({ vendors: {} });
			},

			getVendorPacks: (vendorId) => {
				return get().vendors[vendorId]?.packs ?? [];
			},


			getTotalVendors: () => {
				return Object.values(get().vendors)?.length ?? 0;
			},
			getTotalPacks: () => {
				return Object.values(get().vendors).reduce(
					(sum, v) => sum + v.packs.length,
					0
				);
			},

			getVendorPackCount: (vendorId) => {
				return get().vendors[vendorId]?.packs.length ?? 0;
			},

			getVendorsCount: () => {
				return Object.keys(get().vendors).length;
			},
		}),
		{
			name: CART_STORAGE_KEY,
		}
	)
);

