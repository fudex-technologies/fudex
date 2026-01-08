import { VendorOpeningHour, DayOfWeek } from '@prisma/client';

export const isVendorOpen = (openingHours: VendorOpeningHour[] | undefined | null): boolean => {
    if (!openingHours || openingHours.length === 0) return true;

    const now = new Date();
    const dayMap: Record<number, DayOfWeek> = {
        0: 'SUNDAY',
        1: 'MONDAY',
        2: 'TUESDAY',
        3: 'WEDNESDAY',
        4: 'THURSDAY',
        5: 'FRIDAY',
        6: 'SATURDAY',
    };
    const currentDay = dayMap[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

    const todayHours = openingHours.find(h => h.day === currentDay);

    if (!todayHours) return true;
    if (openingHours.length > 0 && !todayHours) return false;

    if (todayHours.isClosed) return false;
    if (!todayHours.openTime || !todayHours.closeTime) return true;

    return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
};

export const getNextOpenTime = (openingHours: VendorOpeningHour[] | undefined | null): string | null => {
    if (!openingHours || openingHours.length === 0) return null;

    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

    // Loop through the next 7 days starting from today
    for (let i = 0; i < 7; i++) {
        const checkDayIndex = (currentDayIndex + i) % 7;
        const checkDayName = days[checkDayIndex];
        const dayHours = openingHours.find(h => h.day === checkDayName);

        // If defined and not closed
        if (dayHours && !dayHours.isClosed && dayHours.openTime) {
            // For today (i=0), only return if we are BEFORE the open time
            if (i === 0) {
                if (currentTime < dayHours.openTime) {
                    return `Today at ${dayHours.openTime}`;
                }
                // If currently open or closed for night, continuing loop will find tomorrow
            } else {
                // Future days
                const dayLabel = i === 1 ? 'Tomorrow' : checkDayName.charAt(0) + checkDayName.slice(1).toLowerCase(); // Tomorrow or Monday/Tuesday...
                return `${dayLabel} at ${dayHours.openTime}`;
            }
        }
    }

    return null;
};

export const getNextCloseTime = (openingHours: VendorOpeningHour[] | undefined | null): string | null => {
    if (!openingHours || openingHours.length === 0) return null;

    const days: DayOfWeek[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"
    const currentDay = days[currentDayIndex];

    // Check if currently open and get today's close time
    const todayHours = openingHours.find(h => h.day === currentDay);

    if (todayHours && !todayHours.isClosed && todayHours.closeTime && todayHours.openTime) {
        // If we're currently within opening hours, return today's close time
        if (currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime) {
            return todayHours.closeTime;
        }
    }

    // If not currently open, look for the next opening day and return its close time
    for (let i = 1; i < 7; i++) {
        const checkDayIndex = (currentDayIndex + i) % 7;
        const checkDayName = days[checkDayIndex];
        const dayHours = openingHours.find(h => h.day === checkDayName);

        if (dayHours && !dayHours.isClosed && dayHours.closeTime) {
            return dayHours.closeTime;
        }
    }

    return null;
};

