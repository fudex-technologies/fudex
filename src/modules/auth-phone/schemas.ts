import { z } from "zod";

export const completeRegistrationSchema = z.object({
    token: z.string(),
    password: z
        .string()
        .min(8, "password must be at least 8 characters long.")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
            "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @, $, !, %, , ?, &)."
        ),
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    referralCode: z.string().optional() // Optional referral code during signup
})

// Vendor Onboarding Schemas
export const vendorOnboardingPersonalDetailsSchema = z.object({
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().email("Invalid email address"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    businessName: z.string().min(1, "Business name is required"),
    businessType: z.string().min(1, "Business type is required"),
    isRegistered: z.enum(["yes", "no"]).optional(),
});

export const emailVerificationSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, "OTP must be 6 digits"),
});

export const vendorDetailsSchema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    businessType: z.string().min(1, "Business type is required"),
    email: z.string().email(),
    phone: z.string().min(10),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
});