import { DiscountType, Discount } from '@prisma/client';

// Scope constants as strings to avoid Prisma client type mismatches before migration regeneration
const SCOPE = {
    PRODUCT_ITEM: 'PRODUCT_ITEM',
    VENDOR: 'VENDOR',
    PLATFORM: 'PLATFORM',
    CART: 'CART',
} as const;

type DiscountScopeType = typeof SCOPE[keyof typeof SCOPE];

export class DiscountService {
    /**
     * Retrieves the best active discount for a given product item.
     * Priority: PRODUCT_ITEM > VENDOR > PLATFORM
     * Does NOT include CART scope (handled separately at checkout level).
     */
    static async getBestActiveDiscount(
        prisma: any,
        productItemId: string,
        vendorId: string
    ): Promise<Discount | null> {
        const now = new Date();

        const discounts = await prisma.discount.findMany({
            where: {
                isActive: true,
                startAt: { lte: now },
                endAt: { gte: now },
                OR: [
                    { scope: SCOPE.PRODUCT_ITEM, productItemId },
                    { scope: SCOPE.VENDOR, vendorId },
                    { scope: SCOPE.PLATFORM }
                ]
            }
        });

        if (!discounts || discounts.length === 0) return null;

        const validDiscounts = discounts.filter((d: Discount) => {
            if (d.usageLimit !== null && d.usageCount >= d.usageLimit) return false;
            return true;
        });

        if (validDiscounts.length === 0) return null;

        const priorityWeights: Record<string, number> = {
            [SCOPE.PRODUCT_ITEM]: 3,
            [SCOPE.VENDOR]: 2,
            [SCOPE.PLATFORM]: 1,
        };

        validDiscounts.sort((a: Discount, b: Discount) => {
            const weightA = priorityWeights[a.scope] || 0;
            const weightB = priorityWeights[b.scope] || 0;
            if (weightA !== weightB) return weightB - weightA;
            return b.value - a.value;
        });

        return validDiscounts[0] || null;
    }

    /**
     * Retrieves the best active CART-level discount applicable to a vendor's subtotal.
     * A CART discount is scoped to a specific Vendor or to the PLATFORM (all vendors).
     */
    static async getBestCartDiscount(
        prisma: any,
        vendorId: string
    ): Promise<Discount | null> {
        const now = new Date();

        const discounts = await prisma.discount.findMany({
            where: {
                isActive: true,
                scope: SCOPE.CART,
                startAt: { lte: now },
                endAt: { gte: now },
                OR: [
                    { vendorId }, // Cart discount specific to this vendor
                    { vendorId: null }, // Platform-wide cart discount (no vendor constraint)
                ]
            }
        });

        if (!discounts || discounts.length === 0) return null;

        const validDiscounts = discounts.filter((d: Discount) => {
            if (d.usageLimit !== null && d.usageCount >= d.usageLimit) return false;
            return true;
        });

        if (validDiscounts.length === 0) return null;

        // Prefer vendor-specific over platform-wide, then by value
        validDiscounts.sort((a: Discount, b: Discount) => {
            // Vendor-specific gets priority
            const aIsVendorSpecific = a.vendorId === vendorId ? 1 : 0;
            const bIsVendorSpecific = b.vendorId === vendorId ? 1 : 0;
            if (aIsVendorSpecific !== bIsVendorSpecific) return bIsVendorSpecific - aIsVendorSpecific;
            return b.value - a.value;
        });

        return validDiscounts[0] || null;
    }

    /**
     * Calculates the discounted price using a provided discount.
     * Ensures final price is never negative.
     */
    static calculateDiscountedPrice(
        basePrice: number,
        discount: Discount | null
    ): { originalPrice: number; discountAmount: number; finalPrice: number; appliedDiscountId: string | null } {
        if (!discount) {
            return { originalPrice: basePrice, discountAmount: 0, finalPrice: basePrice, appliedDiscountId: null };
        }

        let discountAmount = 0;
        if (discount.type === DiscountType.PERCENTAGE) {
            discountAmount = basePrice * (discount.value / 100);
        } else if (discount.type === DiscountType.FIXED) {
            discountAmount = discount.value;
        }

        if (discountAmount > basePrice) discountAmount = basePrice;
        const finalPrice = Math.max(0, basePrice - discountAmount);

        return { originalPrice: basePrice, discountAmount, finalPrice, appliedDiscountId: discount.id };
    }

    /**
     * Combination method to fetch best item-level discount and calculate final price.
     */
    static async getCalculatedPrice(
        prisma: any,
        productItemId: string,
        vendorId: string,
        basePrice: number
    ) {
        const discount = await this.getBestActiveDiscount(prisma, productItemId, vendorId);
        return this.calculateDiscountedPrice(basePrice, discount);
    }

    /**
     * Combination method to fetch best CART discount and calculate cart-level discount amount.
     */
    static async getCalculatedCartDiscount(
        prisma: any,
        vendorId: string,
        subTotal: number
    ): Promise<{ discountAmount: number; finalSubTotal: number; appliedDiscountId: string | null; discount: Discount | null }> {
        const discount = await this.getBestCartDiscount(prisma, vendorId);
        if (!discount) {
            return { discountAmount: 0, finalSubTotal: subTotal, appliedDiscountId: null, discount: null };
        }
        const { discountAmount, finalPrice } = this.calculateDiscountedPrice(subTotal, discount);
        return { discountAmount, finalSubTotal: finalPrice, appliedDiscountId: discount.id, discount };
    }
}
