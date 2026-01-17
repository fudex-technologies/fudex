import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { normalizePhoneNumber, generateOTP, hashOTP, compareOTP } from '@/lib/commonFunctions';
import { auth } from '@/lib/auth';
import { sendEmailVerification } from '@/lib/email';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { completeRegistrationSchema } from '../schemas';


const TERMII_BASE = process.env.TERMII_BASE_URL;
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const VERIFICATION_EXP_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 50;
const MAX_ATTEMPTS = 5;
const HMAC_SECRET = process.env.BETTER_AUTH_SECRET ?? 'secret';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

function signVerificationToken(payload: { phone: string; pvId: string; exp: number }) {
    const json = JSON.stringify(payload);
    const b64 = Buffer.from(json).toString('base64url');
    const sig = crypto.createHmac('sha256', HMAC_SECRET).update(b64).digest('base64url');
    return `${b64}.${sig}`;
}

function verifyVerificationToken(token: string) {
    try {
        const [b64, sig] = token.split('.');
        const expected = crypto.createHmac('sha256', HMAC_SECRET).update(b64).digest('base64url');
        if (!sig || expected !== sig) return null;
        const json = Buffer.from(b64, 'base64url').toString('utf8');
        const payload = JSON.parse(json) as { phone: string; pvId: string; exp: number };
        if (Date.now() > payload.exp) return null;
        return payload;
    } catch (e) {
        return null;
    }
}

export async function sendTwilioSms(phone234: string, otp: string) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) throw new Error('TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN not configured');
    const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const sms = `Your FUDEX verification code is ${otp}. It expires in 5 minutes.`;

    await client.messages.create({
        body: sms,
        messagingServiceSid: 'MG2d41fd1ddd9304add9c3213a2ff9aaf3',
        to: `+${phone234}`
    }).then((message: any) => {
        console.log(message.sid)
    }).catch((err: any) => {
        console.log(err)
    });

    return Promise.resolve();
}

async function sendTermiiSms(phone234: string, otp: string) {
    if (!TERMII_API_KEY) throw new Error('TERMII_API_KEY not configured');
    if (!TERMII_BASE) throw new Error('TERMII_BASE not configured');
    const sms = `Your FUDEX verification code is ${otp}. It expires in 5 minutes.`;
    const url = `${TERMII_BASE}/api/sms/send`;
    const body = {
        api_key: TERMII_API_KEY,
        to: phone234,
        from: 'FUDEX',
        sms,
        type: "plain",
        channel: "generic"
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || (data as any)?.code !== 'ok') {
        throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Termii error: ${res.status} ${(data as any)?.message ?? ''}`
        });
    }
    return data;
}

export const phoneAuthRouter = createTRPCRouter({
    requestOtp: publicProcedure
        .input(z.object({ phone: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const raw = input.phone;
            const phone = normalizePhoneNumber(raw);

            // ensure unique phone
            const existing = await ctx.prisma.user.findFirst({ where: { phone } });
            if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'PHONE_ALREADY_IN_USE' });

            // rate limit: check last created within cooldown
            const last = await ctx.prisma.phoneVerification.findFirst({
                where:
                    { phone },
                orderBy: { createdAt: 'desc' }
            });
            if (last) {
                const secondsSince = (Date.now() - last.createdAt.getTime()) / 1000;
                if (secondsSince < RESEND_COOLDOWN_SECONDS) {
                    throw new TRPCError({
                        code: 'TOO_MANY_REQUESTS', message: 'RESEND_COOLDOWN'
                    });
                }
            }

            // generate OTP and hash
            const otp = generateOTP();
            const otpHash = await hashOTP(otp);
            const expiresAt = new Date(Date.now() + VERIFICATION_EXP_MINUTES * 60 * 1000);

            // create new verification record (new invalidates previous logically)
            const pv = await ctx.prisma.phoneVerification.create({
                data: { phone, otpHash, expiresAt }
            });

            // send SMS
            try {
                await sendTermiiSms(phone, otp);

            } catch (e: any) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'SMS_SEND_FAILED' });
            }

            return { success: true, id: pv.id };
        }),

    verifyOtp: publicProcedure
        .input(z.object({ phone: z.string(), otp: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const phone = normalizePhoneNumber(input.phone);
            const pv = await ctx.prisma.phoneVerification.findFirst({
                where: { phone }, orderBy: { createdAt: 'desc' }
            });

            if (!pv) throw new TRPCError({
                code: 'UNAUTHORIZED', message: 'OTP_INVALID'
            });
            if (pv.verified) {
                // issue token anyway
                const token = signVerificationToken({
                    phone, pvId: pv.id, exp: Date.now() + 5 * 60 * 1000
                });
                return { token };
            }
            if (pv.attempts >= MAX_ATTEMPTS) throw new TRPCError({
                code: 'TOO_MANY_REQUESTS', message: 'OTP_TOO_MANY_ATTEMPTS'
            });
            if (pv.expiresAt.getTime() < Date.now()) throw new TRPCError({ code: 'BAD_REQUEST', message: 'OTP_EXPIRED' });

            const ok = await compareOTP(input.otp, pv.otpHash);
            if (!ok) {
                await ctx.prisma.phoneVerification.update({ where: { id: pv.id }, data: { attempts: { increment: 1 } } as any });
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'OTP_INVALID' });
            }

            // mark verified
            await ctx.prisma.phoneVerification.update({ where: { id: pv.id }, data: { verified: true } });

            // Update user record if exists
            const existingUser = await ctx.prisma.user.findUnique({ where: { phone } });
            if (existingUser) {
                await ctx.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { phoneVerified: true }
                });
            }

            const token = signVerificationToken({ phone, pvId: pv.id, exp: Date.now() + 5 * 60 * 1000 });
            return { token };
        }),

    completeSignupPrepare: publicProcedure
        .input(completeRegistrationSchema)
        .mutation(async ({ ctx, input }) => {
            const payload = verifyVerificationToken(input.token);
            if (!payload) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_VERIFICATION_TOKEN" });
            }
            const phone = payload.phone;
            const pv = await ctx.prisma.phoneVerification.findUnique({
                where: { id: payload.pvId },
            });
            if (!pv || !pv.verified) {
                throw new TRPCError({ code: "BAD_REQUEST", message: "INVALID_VERIFICATION_TOKEN" });
            }

            const existing = await ctx.prisma.user.findFirst({
                where: { phone },
            });

            if (existing) {
                throw new TRPCError({ code: "CONFLICT", message: "PHONE_ALREADY_IN_USE" });
            }

            return {
                phone,
                email: input.email,
                name: `${input.firstName} ${input.lastName}`,
            };
        }),

    loginWithPhoneResolver: publicProcedure
        .input(z.object({
            phone: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            const phone = normalizePhoneNumber(input.phone);

            const user = await ctx.prisma.user.findUnique({
                where: { phone },
                select: { email: true },
            });

            if (!user?.email) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "INVALID_CREDENTIALS",
                });
            }

            return { email: user.email };
        }),

    // Attach a verified phone to the current (logged-in) user — used for Google users linking phone
    attachVerifiedPhone: protectedProcedure
        .input(z.object({ token: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const payload = verifyVerificationToken(input.token);
            if (!payload) throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_VERIFICATION_TOKEN' });
            const phone = payload.phone;
            const pv = await ctx.prisma.phoneVerification.findUnique({ where: { id: payload.pvId } });
            if (!pv || !pv.verified) throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_VERIFICATION_TOKEN' });

            // ensure phone not used by another account
            const other = await ctx.prisma.user.findFirst({ where: { phone, id: { not: ctx.user!.id } } });
            if (other) throw new TRPCError({ code: 'CONFLICT', message: 'PHONE_ALREADY_IN_USE' });

            const updated = await ctx.prisma.user.update({
                where: { id: ctx.user!.id },
                data: { phone, phoneVerified: true }
            });
            return { success: true, user: updated };
        }),

    // Protected: Request OTP for the currently logged-in user's phone
    requestProfileOtp: protectedProcedure
        .mutation(async ({ ctx }) => {
            const user = await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } });
            if (!user?.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "NO_PHONE_ON_PROFILE" });
            const phone = normalizePhoneNumber(user.phone);

            // Rate limit check
            const last = await ctx.prisma.phoneVerification.findFirst({
                where: { phone },
                orderBy: { createdAt: 'desc' }
            });
            if (last) {
                const secondsSince = (Date.now() - last.createdAt.getTime()) / 1000;
                if (secondsSince < RESEND_COOLDOWN_SECONDS) {
                    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'RESEND_COOLDOWN' });
                }
            }

            // Generate & Send
            const otp = generateOTP();
            const otpHash = await hashOTP(otp);
            const expiresAt = new Date(Date.now() + VERIFICATION_EXP_MINUTES * 60 * 1000);

            await ctx.prisma.phoneVerification.create({
                data: { phone, otpHash, expiresAt }
            });

            try {
                await sendTermiiSms(phone, otp);
            } catch (e) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'SMS_SEND_FAILED' });
            }

            return { success: true };
        }),

    // Protected: Verify OTP for the currently logged-in user
    verifyProfileOtp: protectedProcedure
        .input(z.object({ otp: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({ where: { id: ctx.user.id } });
            if (!user?.phone) throw new TRPCError({ code: "BAD_REQUEST", message: "NO_PHONE_ON_PROFILE" });
            const phone = normalizePhoneNumber(user.phone);

            const pv = await ctx.prisma.phoneVerification.findFirst({
                where: { phone },
                orderBy: { createdAt: 'desc' }
            });

            if (!pv) throw new TRPCError({ code: 'UNAUTHORIZED', message: "OTP_INVALID" });
            if (pv.verified) return { success: true }; // Already verified
            if (pv.attempts >= MAX_ATTEMPTS) throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: "OTP_TOO_MANY_ATTEMPTS" });
            if (pv.expiresAt.getTime() < Date.now()) throw new TRPCError({ code: 'BAD_REQUEST', message: "OTP_EXPIRED" });

            const ok = await compareOTP(input.otp, pv.otpHash);
            if (!ok) {
                await ctx.prisma.phoneVerification.update({ where: { id: pv.id }, data: { attempts: { increment: 1 } } as any });
                throw new TRPCError({ code: 'UNAUTHORIZED', message: "OTP_INVALID" });
            }

            // Success: Update PhoneVerification AND User
            await ctx.prisma.phoneVerification.update({ where: { id: pv.id }, data: { verified: true } });
            await ctx.prisma.user.update({
                where: { id: ctx.user.id },
                data: { phoneVerified: true }
            });

            return { success: true };
        }),

    checkPhoneInUse: publicProcedure
        .input(z.object({ phone: z.string() }))
        .query(async ({ ctx, input }) => {
            const phone = normalizePhoneNumber(input.phone)
            const other = await ctx.prisma.user.findFirst({ where: { phone } });
            return { inUse: !!other };
        }),



    checkEmailInUse: publicProcedure
        .input(z.object({ email: z.string() }))
        .query(async ({ ctx, input }) => {
            const email = input.email.toLowerCase().trim();
            const other = await ctx.prisma.user.findFirst({ where: { email } });
            return { inUse: !!other };
        }),

    // ========================================
    // EMAIL OTP PASSWORD RESET (New Flow)
    // ========================================

    // Request OTP for password reset via Email
    requestPasswordResetEmail: publicProcedure
        .input(z.object({ email: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const email = input.email.toLowerCase().trim();

            // Check if user exists with this email
            const user = await ctx.prisma.user.findFirst({ where: { email } });
            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'NO_USER_WITH_EMAIL' });
            }

            // Use better-auth's forgetPasswordEmailOTP to send OTP email
            try {
                await auth.api.forgetPasswordEmailOTP({
                    body: { email }
                });
                return { success: true };
            } catch (e: any) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: e?.message || 'EMAIL_SEND_FAILED'
                });
            }
        }),

    // Reset password with Email OTP (combined verify + reset)
    resetPasswordWithEmailOTP: publicProcedure
        .input(z.object({
            email: z.string(),
            otp: z.string(),
            newPassword: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const email = input.email.toLowerCase().trim();

            // Verify user exists
            const user = await ctx.prisma.user.findFirst({ where: { email } });
            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'NO_USER_WITH_EMAIL' });
            }

            // Use better-auth's resetPasswordEmailOTP to verify OTP and reset password
            try {
                await auth.api.resetPasswordEmailOTP({
                    body: {
                        email,
                        otp: input.otp,
                        password: input.newPassword,
                    }
                });

                return { success: true };
            } catch (e: any) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: e?.message || 'PASSWORD_RESET_FAILED'
                });
            }
        }),


    // ========================================
    // PHONE OTP PASSWORD RESET (Legacy Flow)
    // ========================================

    // Request OTP for password reset via Phone (Legacy)
    requestPasswordResetOtp: publicProcedure
        .input(z.object({ phone: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const phone = normalizePhoneNumber(input.phone);

            // Check if user exists with this phone
            const user = await ctx.prisma.user.findFirst({ where: { phone } });
            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'NO_USER_WITH_PHONE' });
            }

            // Rate limit check
            const last = await ctx.prisma.phoneVerification.findFirst({
                where: { phone },
                orderBy: { createdAt: 'desc' }
            });
            if (last) {
                const secondsSince = (Date.now() - last.createdAt.getTime()) / 1000;
                if (secondsSince < RESEND_COOLDOWN_SECONDS) {
                    throw new TRPCError({
                        code: 'TOO_MANY_REQUESTS',
                        message: 'RESEND_COOLDOWN'
                    });
                }
            }

            // Generate OTP and hash
            const otp = generateOTP();
            const otpHash = await hashOTP(otp);
            const expiresAt = new Date(Date.now() + VERIFICATION_EXP_MINUTES * 60 * 1000);

            // Create verification record
            const pv = await ctx.prisma.phoneVerification.create({
                data: { phone, otpHash, expiresAt }
            });

            // Send SMS
            try {
                await sendTermiiSms(phone, otp);
            } catch (e: any) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'SMS_SEND_FAILED' });
            }

            return { success: true, id: pv.id };
        }),

    // Verify Phone OTP and issue reset token (Legacy)
    verifyPasswordResetOtp: publicProcedure
        .input(z.object({ phone: z.string(), otp: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const phone = normalizePhoneNumber(input.phone);

            // Verify user exists
            const user = await ctx.prisma.user.findFirst({ where: { phone } });
            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'NO_USER_WITH_PHONE' });
            }

            const pv = await ctx.prisma.phoneVerification.findFirst({
                where: { phone },
                orderBy: { createdAt: 'desc' }
            });

            if (!pv) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'OTP_INVALID' });
            if (pv.verified) {
                // Issue token anyway
                const token = signVerificationToken({
                    phone,
                    pvId: pv.id,
                    exp: Date.now() + 15 * 60 * 1000 // 15 minutes for password reset
                });
                return { token };
            }
            if (pv.attempts >= MAX_ATTEMPTS) {
                throw new TRPCError({
                    code: 'TOO_MANY_REQUESTS',
                    message: 'OTP_TOO_MANY_ATTEMPTS'
                });
            }
            if (pv.expiresAt.getTime() < Date.now()) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'OTP_EXPIRED' });
            }

            const ok = await compareOTP(input.otp, pv.otpHash);
            if (!ok) {
                await ctx.prisma.phoneVerification.update({
                    where: { id: pv.id },
                    data: { attempts: { increment: 1 } } as any
                });
                throw new TRPCError({ code: 'UNAUTHORIZED', message: 'OTP_INVALID' });
            }

            // Mark verified
            await ctx.prisma.phoneVerification.update({
                where: { id: pv.id },
                data: { verified: true }
            });

            const token = signVerificationToken({
                phone,
                pvId: pv.id,
                exp: Date.now() + 15 * 60 * 1000 // 15 minutes for password reset
            });
            return { token };
        }),

    // Reset password with verified Phone token (Legacy)
    resetPasswordWithPhoneToken: publicProcedure
        .input(z.object({ token: z.string(), newPassword: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const payload = verifyVerificationToken(input.token);
            if (!payload) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_VERIFICATION_TOKEN' });
            }

            const phone = payload.phone;

            // Verify the phone verification record exists
            const pv = await ctx.prisma.phoneVerification.findUnique({
                where: { id: payload.pvId }
            });

            if (!pv || !pv.verified) {
                throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_VERIFICATION_TOKEN' });
            }

            // Find user by phone
            const user = await ctx.prisma.user.findFirst({ where: { phone } });
            if (!user) {
                throw new TRPCError({ code: 'NOT_FOUND', message: 'NO_USER_WITH_PHONE' });
            }

            // Update password via better-auth
            try {
                // await auth.api.changePassword({
                //     body: {
                //         newPassword: input.newPassword,
                //         // userId: user.id,
                //     }
                // });

                return { success: true };
            } catch (e: any) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: e?.message || 'PASSWORD_UPDATE_FAILED'
                });
            }
        }),

    // ========================================
    // VENDOR ONBOARDING EMAIL VERIFICATION
    // ========================================

    // Request OTP for vendor onboarding email verification
    requestEmailVerificationOtp: publicProcedure
        .input(z.object({ email: z.string().email() }))
        .mutation(async ({ ctx, input }) => {
            const email = input.email.toLowerCase().trim();

            // Check if there's a recent verification request (rate limiting)
            const lastVerification = await ctx.prisma.verification.findFirst({
                where: {
                    identifier: email,
                },
                orderBy: { createdAt: 'desc' }
            });

            if (lastVerification) {
                const secondsSince = (Date.now() - lastVerification.createdAt.getTime()) / 1000;
                if (secondsSince < RESEND_COOLDOWN_SECONDS) {
                    throw new TRPCError({
                        code: 'TOO_MANY_REQUESTS',
                        message: 'RESEND_COOLDOWN'
                    });
                }
            }

            // Generate OTP
            const otp = generateOTP();
            const otpHash = await hashOTP(otp);
            const expiresAt = new Date(Date.now() + VERIFICATION_EXP_MINUTES * 60 * 1000);

            // Create verification record
            const verificationId = crypto.randomUUID();
            await ctx.prisma.verification.create({
                data: {
                    id: verificationId,
                    identifier: email,
                    value: otpHash,
                    expiresAt,
                }
            });

            // Send email with OTP
            try {
                await sendEmailVerification(
                    email,
                    otp,
                    process.env.FUDEX_ONBOARDING_EMAIL as string
                );

                return { success: true };
            } catch (e: any) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'EMAIL_SEND_FAILED'
                });
            }
        }),

    // Verify email OTP for vendor onboarding
    verifyEmailOtp: publicProcedure
        .input(z.object({ email: z.string().email(), otp: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const email = input.email.toLowerCase().trim();

            // Find most recent verification
            const verification = await ctx.prisma.verification.findFirst({
                where: { identifier: email },
                orderBy: { createdAt: 'desc' }
            });

            if (!verification) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'OTP_INVALID'
                });
            }

            // Check expiration
            if (verification.expiresAt.getTime() < Date.now()) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'OTP_EXPIRED'
                });
            }

            // Verify OTP
            const ok = await compareOTP(input.otp, verification.value);
            if (!ok) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'OTP_INVALID'
                });
            }

            // Create verification token (valid for 15 minutes)
            const token = signVerificationToken({
                phone: email, // reusing phone field for email
                pvId: verification.id,
                exp: Date.now() + 15 * 60 * 1000
            });

            // Update user's emailVerified if exists
            const existingUser = await ctx.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                await ctx.prisma.user.update({
                    where: { id: existingUser.id },
                    data: { emailVerified: true }
                });
            }

            return { token, isExistingUser: !!existingUser };
        }),

    // Check if user exists by email or phone with detailed info
    checkUserByEmailOrPhone: publicProcedure
        .input(z.object({
            email: z.string().email().optional(),
            phone: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            if (!input.email && !input.phone) {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: 'EMAIL_OR_PHONE_REQUIRED'
                });
            }

            const email = input.email?.toLowerCase().trim();
            const phone = input.phone ? normalizePhoneNumber(input.phone) : undefined;

            // Check by email or phone
            const user = await ctx.prisma.user.findFirst({
                where: {
                    OR: [
                        ...(email ? [{ email }] : []),
                        ...(phone ? [{ phone }] : []),
                    ]
                },
                select: {
                    id: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    name: true,
                    emailVerified: true,
                    phoneVerified: true,
                }
            });

            if (!user) {
                return { exists: false, user: null };
            }

            return {
                exists: true,
                user: {
                    id: user.id,
                    email: user.email,
                    phone: user.phone,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: user.name,
                    emailVerified: user.emailVerified,
                    phoneVerified: user.phoneVerified,
                }
            };
        })
});

export default phoneAuthRouter;
