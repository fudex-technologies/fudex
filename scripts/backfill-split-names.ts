import prisma from '@/lib/prisma';
import 'dotenv/config';


async function main() {
    const dryRun = process.argv.includes('--dry-run');
    const batchSize = 200;
    let skip = 0;

    while (true) {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    { name: { not: undefined } },
                    { OR: [{ firstName: null }, { lastName: null }] },
                ],
            },
            take: batchSize,
            skip,
        });

        if (users.length === 0) break;

        for (const u of users) {
            const raw = (u.name || '').trim();
            if (!raw) continue;
            const parts = raw.split(/\s+/);
            const firstName = parts.shift() || null;
            const lastName = parts.length ? parts.join(' ') : null;

            if (!dryRun) {
                try {
                    await prisma.user.update({ where: { id: u.id }, data: { firstName, lastName } as any });
                } catch (err) {
                    console.error('Failed to update user', u.id, err);
                }
            }
        }

        if (users.length < batchSize) break;
        skip += users.length;
    }

    console.log('Done');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
