import { prisma } from '../lib/prisma';

export async function createDeposit(data: any, createdById?: string) {
  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Mặc định 7 ngày

  return prisma.deposit.create({
    data: { ...data, expiresAt, createdById, status: 'PENDING' },
    include: { vehicle: true, createdBy: true },
  });
}

export async function checkExpiredDeposits() {
  const now = new Date();
  const expired = await prisma.deposit.findMany({
    where: { status: { in: ['PENDING', 'CONFIRMED'] }, expiresAt: { lt: now } },
  });
  if (expired.length > 0) {
    await prisma.deposit.updateMany({
      where: { id: { in: expired.map((d) => d.id) } },
      data: { status: 'EXPIRED' },
    });
  }
  return expired.length;
}
