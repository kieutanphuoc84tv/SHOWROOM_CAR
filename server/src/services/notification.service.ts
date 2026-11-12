import { prisma } from '../lib/prisma';

// ── Notification Helpers ─────────────────────────────────────

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  linkUrl?: string
) {
  return prisma.notification.create({
    data: { userId, type, title, message, linkUrl },
  });
}

export async function notifyAdmins(
  type: string,
  title: string,
  message: string,
  linkUrl?: string
) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', isActive: true },
    select: { id: true },
  });
  if (admins.length === 0) return;

  await prisma.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, type, title, message, linkUrl })),
  });
}

export async function notifySales(
  userId: string,
  type: string,
  title: string,
  message: string,
  linkUrl?: string
) {
  return createNotification(userId, type, title, message, linkUrl);
}
