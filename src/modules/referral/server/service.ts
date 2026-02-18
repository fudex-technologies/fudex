import prisma from '@/lib/prisma';
import { ReferralStatus, WalletTransactionSource } from '@prisma/client';
import { WalletService } from '@/modules/wallet/server/service';
import { getDoodleAvatarUrl } from '@/lib/commonFunctions';

export class ReferralService {
    /**
     * Processes referral rewards when a user's order is delivered.
     * Marks referral as confirmed on 1st order and awards ₦100 to referrer (capped).
     */
    static async processReferralRewardOnOrder(referredUserId: string) {
        return await prisma.$transaction(async (tx) => {
            // Check if user was referred
            const referral = await tx.referral.findUnique({
                where: { referredUserId },
                include: { referrer: true }
            });

            if (!referral) return;

            const deliveredOrders = await tx.order.count({
                where: { userId: referredUserId, status: 'DELIVERED' }
            });

            let currentReferral = referral;

            // 1. Mark as CONFIRMED if it's their first delivered order
            if (deliveredOrders === 1 && referral.status === ReferralStatus.PENDING) {
                currentReferral = await tx.referral.update({
                    where: { id: referral.id },
                    data: {
                        status: ReferralStatus.CONFIRMED,
                        confirmedAt: new Date()
                    }
                }) as any;
            }

            // 2. Award ₦100 to referrer if eligible
            // Eligibility: This referral must be one of the first 5 to be CONFIRMED for this referrer.
            if (currentReferral.status !== ReferralStatus.CONFIRMED || !currentReferral.confirmedAt) {
                return;
            }

            // const confirmedRank = await tx.referral.count({
            //                 where: {
            //                     referrerUserId: referral.referrerUserId,
            //                     status: ReferralStatus.CONFIRMED,
            //                     confirmedAt: {
            //                         lte: currentReferral.confirmedAt
            //                     }
            //                 }
            //             });

            //             // If this is the 6th+ person to ever be confirmed, they don't generate rewards.
            //             if (confirmedRank > 5) return;

            // Condition B: This referee has not exceeded 5 delivered orders
            if (deliveredOrders > 5) return;

            // Award reward
            await WalletService.creditWallet({
                userId: referral.referrerUserId,
                amount: 100,
                sourceType: WalletTransactionSource.REFERRAL_BONUS,
                reference: `REF-ORDER-${referredUserId}-${deliveredOrders}`,
            }, tx);
        });
    }

    /**
     * Gets the monthly leaderboard for top referrers.
     * Ranks by total delivered orders from their referred users.
     */
    static async getMonthlyLeaderboard(limit = 5) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // Get all confirmed referrals from this month
        const referrals = await prisma.referral.findMany({
            where: {
                status: ReferralStatus.CONFIRMED,
                confirmedAt: {
                    gte: startOfMonth
                }
            },
            select: {
                referrerUserId: true,
                referredUserId: true
            }
        });

        // Count delivered orders for each referrer
        const referrerOrderCounts = new Map<string, number>();

        for (const referral of referrals) {
            const deliveredOrderCount = await prisma.order.count({
                where: {
                    userId: referral.referredUserId,
                    status: 'DELIVERED'
                }
            });

            const currentCount = referrerOrderCounts.get(referral.referrerUserId) || 0;
            referrerOrderCounts.set(referral.referrerUserId, currentCount + deliveredOrderCount);
        }

        // Sort by order count and take top N
        const sortedReferrers = Array.from(referrerOrderCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);

        // Enrich with user names
        const enrichedLeaderboard = await Promise.all(sortedReferrers.map(async ([userId, count]) => {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, name: true, firstName: true, lastName: true, image: true }
            });
            return {
                userId,
                name: user?.name || `${user?.firstName} ${user?.lastName}`.trim() || 'Anonymous',
                image: getDoodleAvatarUrl(user?.id),
                count
            };
        }));

        return enrichedLeaderboard;
    }

    /**
     * Gets order statistics for a user's referees.
     */
    static async getRefereeStats(referrerUserId: string) {
        const referrals = await prisma.referral.findMany({
            where: { referrerUserId },
            include: {
                referred: {
                    select: {
                        id: true,
                        name: true,
                        firstName: true,
                        lastName: true,
                        image: true,
                        _count: {
                            select: {
                                orders: {
                                    where: { status: 'DELIVERED' }
                                }
                            }
                        }
                    }
                }
            }
        });

        return referrals.map(ref => ({
            id: ref.id,
            status: ref.status,
            createdAt: ref.createdAt,
            confirmedAt: ref.confirmedAt,
            user: {
                name: ref.referred.name || `${ref.referred.firstName} ${ref.referred.lastName}`.trim() || 'User',
                image: getDoodleAvatarUrl(ref.referred.id),
                orderCount: Math.min(ref.referred._count.orders, 5) // Capped at 5 as requested
            }
        }));
    }
}
