import { createTRPCRouter, publicProcedure, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { normalizePhoneNumber, generateOTP, hashOTP, compareOTP } from '@/lib/commonFunctions';
import { auth } from '@/lib/auth';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { completeRegistrationSchema } from '../schemas';
import { headers } from 'next/headers';


const TERMII_BASE = process.env.TERMII_BASE_URL;
const TERMII_API_KEY = process.env.TERMII_API_KEY;
const VERIFICATION_EXP_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 50;
const MAX_ATTEMPTS = 5;
const HMAC_SECRET = process.env.BETTER_AUTH_SECRET ?? 'secret';

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

async function sendTermiiSms(phone234: string, otp: string) {
    if (!TERMII_API_KEY) throw new Error('TERMII_API_KEY not configured');
    if (!TERMII_BASE) throw new Error('TERMII_BASE not configured');
    const sms = `Your verification code is ${otp}. It expires in 5 minutes.`;
    const url = `${TERMII_BASE}/api/sms/send`;
    const body = {
        api_key: TERMII_API_KEY,
        to: phone234,
        from: 'Fudex',
        sms,
        type: "plain",
        channel: "whatsapp"
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    const data = await res.json();

    console.log("TERMII STATUS:", res.status);
    console.log("TERMII RESPONSE:", data);

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Termii error: ${res.status} ${text}` });
    }
    return await res.json();
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

            const token = signVerificationToken({ phone, pvId: pv.id, exp: Date.now() + 5 * 60 * 1000 });
            return { token };
        }),

    completeSignup: publicProcedure
        .input(completeRegistrationSchema)
        .mutation(async ({ ctx, input }) => {
            const payload = verifyVerificationToken(input.token);
            if (!payload) throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_VERIFICATION_TOKEN' });

            const phone = payload.phone;
            const pv = await ctx.prisma.phoneVerification.findUnique({ where: { id: payload.pvId } });
            if (!pv || !pv.verified) throw new TRPCError({ code: 'BAD_REQUEST', message: 'INVALID_VERIFICATION_TOKEN' });

            // ensure unique phone
            const existing = await ctx.prisma.user.findFirst({ where: { phone } });
            if (existing) throw new TRPCError({ code: 'CONFLICT', message: 'PHONE_ALREADY_IN_USE' });

            // create via BetterAuth server API
            try {
                const signUpRes = await auth.api.signUpEmail({
                    body: {
                        name: `${input.firstName} ${input.lastName}`,
                        password: input.password,
                        email: input.email,
                        rememberMe: true,
                    }
                });
                // BetterAuth returns the user (or session.user)
                const userId = signUpRes.user.id;
                // Attach phone to the user
                await ctx.prisma.user.update({
                    where: { id: userId },
                    data: {
                        phone,
                    },
                });

                return { success: true, user: signUpRes.user };
            } catch (e: any) {
                throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e?.message || 'SIGNUP_FAILED' });
            }
        }),

    loginWithPhone: publicProcedure
        .input(z.object({
            phone: z.string(),
            password: z.string(),
            rememberMe: z.boolean().optional(),
            callbackUrl: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const phone = normalizePhoneNumber(input.phone);

            // 1️⃣ Find user by phone
            const user = await ctx.prisma.user.findUnique({
                where: { phone },
                select: { email: true },
            });

            if (!user?.email) {
                throw new TRPCError({
                    code: 'UNAUTHORIZED',
                    message: 'INVALID_CREDENTIALS',
                });
            }

            try {
                const res = await auth.api.signInEmail({
                    body: {
                        email: user.email,
                        password: input.password,
                        rememberMe: input?.rememberMe ?? false,
                        callbackURL: input?.callbackUrl ?? undefined,
                    },
                    // This endpoint requires session cookies.
                    headers: await headers(),
                });
                return { success: true, res };
            } catch (e: any) {
                throw new TRPCError({ code: 'UNAUTHORIZED', message: e?.message || 'AUTH_FAILED' });
            }
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

            const updated = await ctx.prisma.user.update({ where: { id: ctx.user!.id }, data: { phone } as any });
            return { success: true, user: updated };
        }),
});

export default phoneAuthRouter;
