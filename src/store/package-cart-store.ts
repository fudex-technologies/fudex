import { create } from "zustand";
import { persist } from "zustand/middleware";

// Package cart item structure
export interface PackageCartItem {
	id: string;
	packageItemId: string;
	quantity: number;
}

export interface PackageCartAddon {
	id: string;
	productItemId: string;
	quantity: number;
}

export interface PackageCartState {
	packageId: string | null;
	items: PackageCartItem[];
	addons: PackageCartAddon[];

	// Actions
	setPackage: (packageId: string) => void;
	addItem: (packageItemId: string, quantity?: number) => void;
	updateItem: (itemId: string, quantity: number) => void;
	removeItem: (itemId: string) => void;

	addAddon: (productItemId: string, quantity?: number) => void;
	updateAddon: (id: string, quantity: number) => void;
	removeAddon: (id: string) => void;

	clearCart: () => void;

	// Getters
	getItem: (packageItemId: string) => PackageCartItem | undefined;
	getAddon: (productItemId: string) => PackageCartAddon | undefined;
	getTotalItems: () => number;
	isEmpty: () => boolean;
}

const PACKAGE_CART_STORAGE_KEY = "fudex:package-cart";

export const usePackageCartStore = create<PackageCartState>()(
	persist(
		(set, get) => ({
			packageId: null,
			items: [],
			addons: [],

			setPackage: (packageId) => {
				set({ packageId, items: [], addons: [] }); // Clear items and addons when package changes
			},

			addItem: (packageItemId, quantity = 1) => {
				const existingItem = get().items.find(
					(item) => item.packageItemId === packageItemId
				);

				if (existingItem) {
					// Update quantity if item already exists
					set((state) => ({
						items: state.items.map((item) =>
							item.id === existingItem.id
								? { ...item, quantity: item.quantity + quantity }
								: item
						),
					}));
				} else {
					// Add new item
					const newItem: PackageCartItem = {
						id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
						packageItemId,
						quantity,
					};

					set((state) => ({
						items: [...state.items, newItem],
					}));
				}
			},

			updateItem: (itemId, quantity) => {
				if (quantity <= 0) {
					get().removeItem(itemId);
					return;
				}

				set((state) => ({
					items: state.items.map((item) =>
						item.id === itemId ? { ...item, quantity } : item
					),
				}));
			},

			removeItem: (itemId) => {
				set((state) => ({
					items: state.items.filter((item) => item.id !== itemId),
				}));
			},

			addAddon: (productItemId, quantity = 1) => {
				const existingAddon = get().addons.find(
					(addon) => addon.productItemId === productItemId
				);

				if (existingAddon) {
					set((state) => ({
						addons: state.addons.map((addon) =>
							addon.id === existingAddon.id
								? { ...addon, quantity: addon.quantity + quantity }
								: addon
						),
					}));
				} else {
					const newAddon: PackageCartAddon = {
						id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
						productItemId,
						quantity,
					};

					set((state) => ({
						addons: [...state.addons, newAddon],
					}));
				}
			},

			updateAddon: (id, quantity) => {
				if (quantity <= 0) {
					get().removeAddon(id);
					return;
				}

				set((state) => ({
					addons: state.addons.map((addon) =>
						addon.id === id ? { ...addon, quantity } : addon
					),
				}));
			},

			removeAddon: (id) => {
				set((state) => ({
					addons: state.addons.filter((addon) => addon.id !== id),
				}));
			},

			clearCart: () => {
				set({ packageId: null, items: [], addons: [] });
			},

			getItem: (packageItemId) => {
				return get().items.find(
					(item) => item.packageItemId === packageItemId
				);
			},

			getAddon: (productItemId) => {
				return get().addons.find(
					(addon) => addon.productItemId === productItemId
				);
			},

			getTotalItems: () => {
				return get().items.reduce((sum, item) => sum + item.quantity, 0) +
					get().addons.reduce((sum, addon) => sum + addon.quantity, 0);
			},

			isEmpty: () => {
				return get().items.length === 0 && get().addons.length === 0;
			},
		}),
		{
			name: PACKAGE_CART_STORAGE_KEY,
		}
	)
);

