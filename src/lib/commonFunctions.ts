import crypto from "crypto";
import bcrypt from "bcryptjs";



export const formatCurency = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
    }).format(price);
};

export const formatCountDownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};


export const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
};

// Color mapping for different categories
export const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
        'Cardiology': 'bg-red-100',
        'Pediatrics': 'bg-blue-100',
        'Neurology': 'bg-purple-100',
        'General Practice': 'bg-green-100',
        'Public Health': 'bg-yellow-100',
        'Dermatology': 'bg-pink-100',
        'Orthopedics': 'bg-indigo-100',
        'Gynecology': 'bg-rose-100',
        'Ophthalmology': 'bg-cyan-100',
        'Psychiatry': 'bg-violet-100',
        'Dentistry': 'bg-emerald-100',
        'Endocrinology': 'bg-orange-100',
    };
    return colorMap[category] || 'bg-gray-100';
};

export const shortenText = (text: string, by?: number) => {
    if (text?.length > (by || 30)) {
        return `${text.slice(0, (by || 30))}...`;
    }
    return text;
}


// Helper function to format date
export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Helper function to format time
export const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

export const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
};

function isNumericRegex(str: string) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

export function formatNumber(num: number | string): string {
    if (!isNumericRegex(num.toString())) {
        return num.toString();
    }
    if (typeof num === 'string') {
        num = parseFloat(num);
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(2).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(2).replace(/\.0$/, '') + 'K';
    }
    // add commas as thousand separators
    return num.toLocaleString('en-US');
}

export const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute
                .toString()
                .padStart(2, '0')}`;
            options.push(time);
        }
    }
    return options;
};

export const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
};

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


export function normalizePhoneNumber(phone: string) {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("234")) {
        cleaned = cleaned.slice(3);
    }

    if (cleaned.startsWith("0")) {
        cleaned = cleaned.slice(1);
    }

    // Nigerian numbers must be exactly 10 digits after cleanup
    if (cleaned.length !== 10) {
        throw new Error("Invalid Nigerian phone number");
    }

    return `234${cleaned}`;
}

export function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

export async function hashOTP(otp: string) {
    return bcrypt.hash(otp, 10);
}

export async function compareOTP(otp: string, hash: string) {
    return bcrypt.compare(otp, hash);
}

export const validateEmailRegex = (email: string) => /\S+@\S+\.\S+/.test(email);
export const validatePhoneNumberRegex = (phone: string) => /^(\+234|234|0)?[789]\d{9}$/.test(phone);
export const validatepasswordRegex = (password: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

export const getDoodleAvatarUrl = (id?: string) =>
    `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(id || 3)}&backgroundColor=D63C12`

export const getFullName = (profile: any) => `${(profile?.firstName || profile?.lastName) &&
    `${profile?.firstName} ${profile?.lastName}`
    } 
${(profile?.firstName || profile?.lastName) && '('}${profile?.name}${(profile?.firstName || profile?.lastName) && ')'}`;