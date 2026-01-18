import { getDoodleAvatarUrl, normalizePhoneNumber } from "@/lib/commonFunctions";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { calculateDeliveryFee, getServiceFee } from "@/lib/deliveryFeeCalculator";

// Generate unique 7-character alphanumeric referral code
function generateUniqueReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export const userRouter = createTRPCRouter({
    // Return resolved session (null if unauthenticated)
    session: publicProcedure.query(({ ctx }) => ctx.session),

    // Profile: read own profile and compute DiceBear avatar URL (no upload)
    profile: protectedProcedure.query(async ({ ctx }) => {
        const sessionUser = ctx.user!;
        const user = await ctx.prisma.user.findUnique({
            where: { id: sessionUser.id }
        });
        const avatarUrl = getDoodleAvatarUrl(sessionUser.id);

        return {
            id: sessionUser.id,
            name: user?.name ?? sessionUser.name,
            firstName: user?.firstName ?? null,
            lastName: user?.lastName ?? null,
            email: user?.email ?? sessionUser.email,
            emailVerified: user?.emailVerified ?? sessionUser.emailVerified,
            phone: user?.phone ?? null,
            phoneVerified: user?.phoneVerified ?? false,
            image: user?.image ?? sessionUser.image ?? avatarUrl,
            avatarUrl,
        };
    }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                firstName: z.string().optional(),
                lastName: z.string().optional(),
                image: z.string().url().optional(),
                phone: z.string().optional(),
                email: z.string().email().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const data: any = {};
            if (input.name) data.name = input.name;
            if (input.firstName) data.firstName = input.firstName;
            if (input.lastName) data.lastName = input.lastName;
            if (input.image) data.image = input.image;
            if (input.phone) data.phone = normalizePhoneNumber(input.phone);
            if (input.email) data.email = input.email;

            const updated = await ctx.prisma.user.update({
                where: { id: userId }, data
            }
            );
            return updated;
        }),

    // Addresses CRUD for the authenticated user
    listAddresses: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.address.findMany({ where: { userId: ctx.user!.id }, orderBy: { createdAt: "desc" } });
    }),

    createAddress: protectedProcedure
        .input(
            z.object({
                label: z.string().optional(),
                line1: z.string(),
                line2: z.string().optional(),
                city: z.string(),
                state: z.string().optional(),
                postalCode: z.string().optional(),
                country: z.string().optional(),
                lat: z.number().optional(),
                lng: z.number().optional(),
                isDefault: z.boolean().optional(),
                areaId: z.string(),
                customArea: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (input.isDefault) {
                // unset previous defaults
                await ctx.prisma.address.updateMany({ where: { userId: ctx.user!.id, isDefault: true }, data: { isDefault: false } });
            }
            const created = await ctx.prisma.address.create({ data: { ...input, userId: ctx.user!.id } });
            return created;
        }),

    updateAddress: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                label: z.string().optional(),
                line1: z.string().optional(),
                line2: z.string().optional(),
                city: z.string().optional(),
                state: z.string().optional(),
                postalCode: z.string().optional(),
                country: z.string().optional(),
                lat: z.number().optional(),
                lng: z.number().optional(),
                isDefault: z.boolean().optional(),
                areaId: z.string().optional().nullable(),
                customArea: z.string().optional(),
            })
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.data.isDefault) {
                await ctx.prisma.address.updateMany({
                    where: { userId: ctx.user!.id, isDefault: true },
                    data: { isDefault: false }
                });
            }
            const updated = await ctx.prisma.address.update({
                where: { id: input.id },
                data: input.data
            });
            return updated;
        }),

    deleteAddress: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
        return ctx.prisma.address.delete({ where: { id: input.id } });
    }),


    isVendorFavorited: protectedProcedure
        .input(z.object({ vendorId: z.string() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            const exists = await ctx.prisma.favoriteVendor.findUnique({
                where: {
                    userId_vendorId: {
                        userId,
                        vendorId: input.vendorId,
                    },
                },
                select: { id: true },
            });

            return Boolean(exists);
        }),

    toggleFavoriteVendor: protectedProcedure
        .input(z.object({ vendorId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user.id;

            const existing = await ctx.prisma.favoriteVendor.findUnique({
                where: {
                    userId_vendorId: {
                        userId,
                        vendorId: input.vendorId,
                    },
                },
            });

            if (existing) {
                await ctx.prisma.favoriteVendor.delete({
                    where: { id: existing.id },
                });
                return { favorited: false };
            }

            await ctx.prisma.favoriteVendor.create({
                data: {
                    userId,
                    vendorId: input.vendorId,
                },
            });

            return { favorited: true };
        }),

    getMyFavoriteVendors: protectedProcedure
        .input(
            z.object({
                take: z.number().optional().default(20),
                skip: z.number().optional().default(0),
            })
        )
        .query(async ({ ctx, input }) => {
            return ctx.prisma.favoriteVendor.findMany({
                where: { userId: ctx.user.id },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: {
                        include: {
                            openingHours: true,
                        },
                    },
                },
            });
        }),


    // Check if user has vendor role
    checkVendorRole: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user!.id;
        const vendorRole = await ctx.prisma.userRole.findFirst({
            where: {
                userId,
                role: "VENDOR"
            }
        });
        return !!vendorRole;
    }),

    // Check if user has super admin role
    checkAdminRole: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user!.id;
        const adminRole = await ctx.prisma.userRole.findFirst({
            where: {
                userId,
                role: "SUPER_ADMIN"
            }
        });
        return !!adminRole;
    }),

    // ========== PUBLIC PROCEDURES FOR AREAS AND FEES ==========

    // List all areas (for address dropdown)
    listAreas: publicProcedure
        .input(z.object({
            state: z.string().optional(),
            take: z.number().optional().default(100)
        }).optional())
        .query(({ ctx, input }) => {
            const where: any = {};
            if (input?.state) {
                where.state = {
                    equals: input.state,
                    mode: 'insensitive',
                };
            }
            return ctx.prisma.area.findMany({
                where,
                take: input?.take ?? 100,
                orderBy: [{ state: "asc" }, { name: "asc" }]
            });
        }),

    // Calculate delivery fee for preview (public, used in checkout)
    calculateDeliveryFee: publicProcedure
        .input(z.object({
            areaId: z.string().nullable(),
        }))
        .query(async ({ ctx, input }) => {
            const fee = await calculateDeliveryFee(ctx.prisma, input.areaId);
            return { deliveryFee: fee };
        }),

    // Get service fee (public, used in checkout)
    getServiceFee: publicProcedure
        .query(async ({ ctx }) => {
            const fee = await getServiceFee(ctx.prisma);
            return { serviceFee: fee };
        }),

    // Get referral statistics for current user
    getReferralStats: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.user!.id;

            // Get user's referral code
            const user = await ctx.prisma.user.findUnique({
                where: { id: userId },
                select: { referralCode: true }
            });

            if (!user?.referralCode) {
                return {
                    referralCode: null,
                    totalReferred: 0,
                    confirmedReferred: 0,
                    referrals: [],
                };
            }

            // Get all referrals for this user
            const referrals = await ctx.prisma.referral.findMany({
                where: { referrerUserId: userId },
                select: {
                    id: true,
                    referred: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            createdAt: true,
                        }
                    },
                    status: true,
                    confirmedAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' }
            });

            const confirmedCount = referrals.filter(r => r.status === 'CONFIRMED').length;

            return {
                referralCode: user.referralCode,
                totalReferred: referrals.length,
                confirmedReferred: confirmedCount,
                referrals: referrals.map(r => ({
                    id: r.id,
                    userName: r.referred.name,
                    userEmail: r.referred.email,
                    status: r.status,
                    confirmedAt: r.confirmedAt,
                    createdAt: r.createdAt,
                })),
            };
        }),

    // Generate a new referral code for user if they don't have one
    generateReferralCode: protectedProcedure
        .mutation(async ({ ctx }) => {
            const userId = ctx.user!.id;

            const user = await ctx.prisma.user.findUnique({
                where: { id: userId },
                select: { referralCode: true }
            });

            // If user already has a code, return it
            if (user?.referralCode) {
                return { referralCode: user.referralCode, isNewCode: false };
            }

            // Generate unique code
            let referralCode: string = '';
            let isUnique = false;

            while (!isUnique) {
                referralCode = generateUniqueReferralCode();
                const existing = await ctx.prisma.user.findFirst({
                    where: { referralCode }
                });
                isUnique = !existing;
            }

            // Save to user
            const updated = await ctx.prisma.user.update({
                where: { id: userId },
                data: { referralCode },
                select: { referralCode: true }
            });

            return { referralCode: updated.referralCode, isNewCode: true };
        }),
});

