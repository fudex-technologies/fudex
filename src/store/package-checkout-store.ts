import { create } from "zustand";
import { persist } from "zustand/middleware";

// Package checkout state structure
export interface PackageCheckoutState {
	// Recipient details
	recipientName: string;
	recipientPhone: string;
	recipientAddressLine1: string;
	recipientAddressLine2: string | null;
	recipientCity: string;
	recipientState: string | null;
	recipientAreaId: string | null;
	recipientCustomArea: string | null;
	
	// Sender details
	senderName: string;
	
	// Delivery details
	deliveryDate: Date | null;
	timeSlot: string | null; // e.g., "08:00-10:00"
	
	// Card customization
	cardType: "ADMIN_CREATED" | "CUSTOM" | null;
	customCardMessage: string | null;
	
	// Notes
	notes: string | null;
	
	// Actions
	setRecipientDetails: (details: {
		recipientName: string;
		recipientPhone: string;
		recipientAddressLine1: string;
		recipientAddressLine2?: string | null;
		recipientCity: string;
		recipientState?: string | null;
		recipientAreaId?: string | null;
		recipientCustomArea?: string | null;
	}) => void;
	
	setSenderName: (senderName: string) => void;
	
	setDeliveryDetails: (deliveryDate: Date, timeSlot: string) => void;
	
	setCardDetails: (
		cardType: "ADMIN_CREATED" | "CUSTOM",
		customCardMessage?: string | null
	) => void;
	
	setNotes: (notes: string | null) => void;
	
	clearCheckout: () => void;
	
	// Validation
	isRecipientDetailsComplete: () => boolean;
	isDeliveryDetailsComplete: () => boolean;
	isCardDetailsComplete: () => boolean;
	isCheckoutComplete: () => boolean;
}

const PACKAGE_CHECKOUT_STORAGE_KEY = "fudex:package-checkout";

export const usePackageCheckoutStore = create<PackageCheckoutState>()(
	persist(
		(set, get) => ({
			// Initial state
			recipientName: "",
			recipientPhone: "",
			recipientAddressLine1: "",
			recipientAddressLine2: null,
			recipientCity: "",
			recipientState: null,
			recipientAreaId: null,
			recipientCustomArea: null,
			senderName: "",
			deliveryDate: null,
			timeSlot: null,
			cardType: null,
			customCardMessage: null,
			notes: null,
			
			setRecipientDetails: (details) => {
				set({
					recipientName: details.recipientName,
					recipientPhone: details.recipientPhone,
					recipientAddressLine1: details.recipientAddressLine1,
					recipientAddressLine2: details.recipientAddressLine2 ?? null,
					recipientCity: details.recipientCity,
					recipientState: details.recipientState ?? null,
					recipientAreaId: details.recipientAreaId ?? null,
					recipientCustomArea: details.recipientCustomArea ?? null,
				});
			},
			
			setSenderName: (senderName) => {
				set({ senderName });
			},
			
			setDeliveryDetails: (deliveryDate, timeSlot) => {
				set({ deliveryDate, timeSlot });
			},
			
			setCardDetails: (cardType, customCardMessage = null) => {
				set({ cardType, customCardMessage });
			},
			
			setNotes: (notes) => {
				set({ notes });
			},
			
			clearCheckout: () => {
				set({
					recipientName: "",
					recipientPhone: "",
					recipientAddressLine1: "",
					recipientAddressLine2: null,
					recipientCity: "",
					recipientState: null,
					recipientAreaId: null,
					recipientCustomArea: null,
					senderName: "",
					deliveryDate: null,
					timeSlot: null,
					cardType: null,
					customCardMessage: null,
					notes: null,
				});
			},
			
			isRecipientDetailsComplete: () => {
				const state = get();
				return !!(
					state.recipientName &&
					state.recipientPhone &&
					state.recipientAddressLine1 &&
					state.recipientCity
				);
			},
			
			isDeliveryDetailsComplete: () => {
				const state = get();
				return !!(state.deliveryDate && state.timeSlot);
			},
			
			isCardDetailsComplete: () => {
				const state = get();
				if (!state.cardType) return false;
				if (state.cardType === "CUSTOM" && !state.customCardMessage) {
					return false;
				}
				return true;
			},
			
			isCheckoutComplete: () => {
				return (
					get().isRecipientDetailsComplete() &&
					get().isDeliveryDetailsComplete() &&
					get().isCardDetailsComplete() &&
					!!get().senderName
				);
			},
		}),
		{
			name: PACKAGE_CHECKOUT_STORAGE_KEY,
		}
	)
);

