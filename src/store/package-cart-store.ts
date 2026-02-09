import { create } from "zustand";
import { persist } from "zustand/middleware";

// Package cart item structure
export interface PackageCartItem {
	id: string;
	packageItemId: string;
	quantity: number;
}

export interface PackageCartState {
	packageId: string | null;
	items: PackageCartItem[];
	
	// Actions
	setPackage: (packageId: string) => void;
	addItem: (packageItemId: string, quantity?: number) => void;
	updateItem: (itemId: string, quantity: number) => void;
	removeItem: (itemId: string) => void;
	clearCart: () => void;
	
	// Getters
	getItem: (packageItemId: string) => PackageCartItem | undefined;
	getTotalItems: () => number;
	isEmpty: () => boolean;
}

const PACKAGE_CART_STORAGE_KEY = "fudex:package-cart";

export const usePackageCartStore = create<PackageCartState>()(
	persist(
		(set, get) => ({
			packageId: null,
			items: [],
			
			setPackage: (packageId) => {
				set({ packageId, items: [] }); // Clear items when package changes
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
			
			clearCart: () => {
				set({ packageId: null, items: [] });
			},
			
			getItem: (packageItemId) => {
				return get().items.find(
					(item) => item.packageItemId === packageItemId
				);
			},
			
			getTotalItems: () => {
				return get().items.reduce((sum, item) => sum + item.quantity, 0);
			},
			
			isEmpty: () => {
				return get().items.length === 0;
			},
		}),
		{
			name: PACKAGE_CART_STORAGE_KEY,
		}
	)
);

