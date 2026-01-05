import { PrismaClient } from "@prisma/client";

/**
 * Calculate delivery fee based on area and current time
 * @param prisma - Prisma client instance
 * @param areaId - Area ID (null for custom/unknown areas)
 * @param currentTime - Current time in "HH:mm" format (optional, defaults to now)
 * @returns Delivery fee amount
 */
export async function calculateDeliveryFee(
    prisma: PrismaClient,
    areaId: string | null,
    currentTime?: string
): Promise<number> {
    // Get current time if not provided
    const time = currentTime || getCurrentTimeString();
    
    // If no area ID (custom area), use base delivery fee
    if (!areaId) {
        const baseFeeSetting = await prisma.platformSetting.findUnique({
            where: { key: "BASE_DELIVERY_FEE" }
        });
        return baseFeeSetting?.value ? (baseFeeSetting.value as number) : 0;
    }

    // Get delivery fee rules for the area
    const rules = await prisma.deliveryFeeRule.findMany({
        where: { areaId },
        orderBy: { startTime: "asc" }
    });

    // Find matching rule based on current time
    for (const rule of rules) {
        if (isTimeInRange(time, rule.startTime, rule.endTime)) {
            return rule.fee;
        }
    }

    // If no rule matches, fall back to base delivery fee
    const baseFeeSetting = await prisma.platformSetting.findUnique({
        where: { key: "BASE_DELIVERY_FEE" }
    });
    return baseFeeSetting?.value ? (baseFeeSetting.value as number) : 0;
}

/**
 * Get service fee from platform settings
 * @param prisma - Prisma client instance
 * @returns Service fee amount
 */
export async function getServiceFee(prisma: PrismaClient): Promise<number> {
    const serviceFeeSetting = await prisma.platformSetting.findUnique({
        where: { key: "SERVICE_FEE" }
    });
    return serviceFeeSetting?.value ? (serviceFeeSetting.value as number) : 0;
}

/**
 * Get current time in "HH:mm" format
 */
function getCurrentTimeString(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

/**
 * Check if a time is within a range (handles overnight ranges)
 * @param time - Time to check in "HH:mm" format
 * @param startTime - Start time in "HH:mm" format
 * @param endTime - End time in "HH:mm" format
 */
function isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const timeMinutes = timeToMinutes(time);
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    // Handle overnight ranges (e.g., 22:00 to 06:00)
    if (endMinutes < startMinutes) {
        return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }
    
    // Normal range
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

/**
 * Convert time string "HH:mm" to minutes since midnight
 */
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
}

