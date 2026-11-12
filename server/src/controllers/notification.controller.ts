import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// ── GET /api/notifications — For current user ────────────────
export const listNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[listNotifications]', error);
    res.status(500).json({ error: 'Lỗi khi lấy thông báo' });
  }
};

// ── GET /api/notifications/unread-count ──────────────────────
export const unreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });
    res.json({ count });
  } catch (error) {
    console.error('[unreadCount]', error);
    res.status(500).json({ error: 'Lỗi khi đếm thông báo' });
  }
};

// ── PATCH /api/notifications/:id/read ────────────────────────
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notif = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ message: 'Đã đánh dấu đã đọc', count: notif.count });
  } catch (error) {
    console.error('[markAsRead]', error);
    res.status(500).json({ error: 'Lỗi' });
  }
};

// ── PATCH /api/notifications/read-all ────────────────────────
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: `Đã đánh dấu ${result.count} thông báo đã đọc` });
  } catch (error) {
    console.error('[markAllAsRead]', error);
    res.status(500).json({ error: 'Lỗi' });
  }
};
