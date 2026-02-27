import prisma from '@/lib/prisma';
import { Prisma, WalletTransactionType, WalletTransactionSource, WalletFundingStatus } from '@prisma/client';
import { sendWalletTransactionEmail } from '@/lib/email';
import { NotificationService } from '@/modules/notifications/server/service';
import { PAGES_DATA } from '@/data/pagesData';

export class WalletService {
    /**
     * Get a user's wallet or create one if it doesn't exist
     */
    static async getOrCreateWallet(userId: string, tx?: Prisma.TransactionClient) {
        const client = tx || prisma;
        let wallet = await client.wallet.findUnique({
            where: { userId },
        });

        if (!wallet) {
            try {
                wallet = await client.wallet.create({
                    data: {
                        userId,
                        balance: 0,
                    },
                });
            } catch (error) {
                // Handle race condition if two requests try to create wallet at once
                wallet = await client.wallet.findUnique({
                    where: { userId },
                });
                if (!wallet) throw error;
            }
        }

        return wallet;
    }

    /**
     * Credit user's wallet with ledger entry
     */
    static async creditWallet(params: {
        userId: string;
        amount: number | Prisma.Decimal;
        sourceType: WalletTransactionSource;
        sourceId?: string;
        reference: string;
    }, tx?: Prisma.TransactionClient) {
        const execute = async (p: Prisma.TransactionClient) => {
            const wallet = await this.getOrCreateWallet(params.userId, p);

            // Check for existing transaction with same reference (idempotency)
            const existingTx = await p.walletTransaction.findUnique({
                where: { reference: params.reference },
            });

            if (existingTx) {
                return { success: true, transaction: existingTx, alreadyProcessed: true };
            }

            const amount = new Prisma.Decimal(params.amount);

            // Create ledger entry
            const transaction = await p.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: WalletTransactionType.CREDIT,
                    sourceType: params.sourceType,
                    sourceId: params.sourceId,
                    reference: params.reference,
                },
            });

            // Update wallet balance
            await p.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        increment: amount,
                    },
                },
            });

            return { success: true, transaction, alreadyProcessed: false };
        };

        let result;
        if (tx) {
            result = await execute(tx);
        } else {
            result = await prisma.$transaction(execute);
        }

        if (result.success && !result.alreadyProcessed) {
            // Trigger notification email (don't await to avoid blocking)
            WalletService.notifyUserOfTransaction(params.userId, params.amount, WalletTransactionType.CREDIT, params.sourceType, params.reference)
                .catch((err: unknown) => console.error('[WalletService] Credit notification error:', err));
        }

        return result;
    }

    /**
     * Debit user's wallet with ledger entry and balance check
     */
    static async debitWallet(params: {
        userId: string;
        amount: number | Prisma.Decimal;
        sourceType: WalletTransactionSource;
        sourceId?: string;
        reference: string;
    }, tx?: Prisma.TransactionClient) {
        const execute = async (p: Prisma.TransactionClient) => {
            // First, get the wallet to ensure it exists and get its ID
            let wallet = await p.wallet.findUnique({
                where: { userId: params.userId },
            });

            if (!wallet) {
                wallet = await this.getOrCreateWallet(params.userId, p);
            }

            // Explicit lock for concurrency safety
            await p.$executeRaw`SELECT * FROM wallet WHERE id = ${wallet.id} FOR UPDATE`;

            // Re-fetch to get most current balance after lock
            wallet = await p.wallet.findUnique({
                where: { id: wallet.id },
            });

            if (!wallet) {
                throw new Error('Wallet not found after locking');
            }

            // Check for existing transaction with same reference (idempotency)
            const existingTx = await p.walletTransaction.findUnique({
                where: { reference: params.reference },
            });

            if (existingTx) {
                return { success: true, transaction: existingTx, alreadyProcessed: true };
            }

            const amount = new Prisma.Decimal(params.amount);

            if (wallet.balance.lessThan(amount)) {
                throw new Error('Insufficient wallet balance');
            }

            // Create ledger entry
            const transaction = await p.walletTransaction.create({
                data: {
                    walletId: wallet.id,
                    amount,
                    type: WalletTransactionType.DEBIT,
                    sourceType: params.sourceType,
                    sourceId: params.sourceId,
                    reference: params.reference,
                },
            });

            // Update wallet balance
            await p.wallet.update({
                where: { id: wallet.id },
                data: {
                    balance: {
                        decrement: amount,
                    },
                },
            });

            return { success: true, transaction, alreadyProcessed: false };
        };

        let result;
        if (tx) {
            result = await execute(tx);
        } else {
            result = await prisma.$transaction(execute);
        }

        if (result.success && !result.alreadyProcessed) {
            // Trigger notification email
            WalletService.notifyUserOfTransaction(params.userId, params.amount, WalletTransactionType.DEBIT, params.sourceType, params.reference)
                .catch((err: unknown) => console.error('[WalletService] Debit notification error:', err));
        }

        return result;
    }

    /**
     * Send email notification for wallet transaction
     */
    private static async notifyUserOfTransaction(
        userId: string,
        amount: number | Prisma.Decimal,
        type: WalletTransactionType,
        source: WalletTransactionSource,
        reference: string
    ) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true, name: true }
            });

            if (!user) return;

            if (user.email) {
                await sendWalletTransactionEmail({
                    email: user.email,
                    userName: user.name || 'Fudex User',
                    amount: amount.toString(),
                    type: type,
                    source: source,
                    reference: reference,
                    from: process.env.MAIL_SENDER || 'no-reply@fudex.ng'
                }).catch(e => console.error('[WalletService] Failed to send email:', e));
            }

            // Send Push Notification
            const actionTarget = type === 'CREDIT' ? 'credited with' : 'debited by';
            const title = type === 'CREDIT' ? 'Wallet Credited 💳' : 'Wallet Debited 💳';

            NotificationService.sendToUser(userId, {
                title,
                body: `Your wallet has been ${actionTarget} ₦${amount.toString()}.`,
                url: PAGES_DATA.profile_wallet_page,
            }).catch(e => console.error('[WalletService] Failed to send push:', e));
        } catch (error) {
            console.error('[WalletService] Failed to send transaction email:', error);
        }
    }

    /**
     * Initialize a wallet funding attempt
     */
    static async initializeFunding(params: {
        userId: string;
        amount: number | Prisma.Decimal;
        providerRef: string;
        metadata?: any;
    }) {
        return prisma.walletFunding.create({
            data: {
                userId: params.userId,
                amount: params.amount,
                providerRef: params.providerRef,
                status: WalletFundingStatus.PENDING,
                metadata: params.metadata || {},
            },
        });
    }

    /**
     * Process successful funding from webhook
     */
    static async completeFunding(providerRef: string, paidAt?: Date) {
        return prisma.$transaction(async (tx) => {
            const funding = await tx.walletFunding.findUnique({
                where: { providerRef },
            });

            if (!funding) {
                throw new Error('Funding record not found');
            }

            if (funding.status === WalletFundingStatus.COMPLETED) {
                return { success: true, alreadyProcessed: true };
            }

            // Credit the wallet
            await this.creditWallet({
                userId: funding.userId,
                amount: funding.amount,
                sourceType: WalletTransactionSource.WALLET_FUNDING,
                sourceId: funding.id,
                reference: `FUND-${funding.providerRef}`,
            }, tx);

            // Update funding status
            await tx.walletFunding.update({
                where: { id: funding.id },
                data: {
                    status: WalletFundingStatus.COMPLETED,
                    paidAt: paidAt || new Date(),
                },
            });

            return { success: true, alreadyProcessed: false };
        });
    }
}
