import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

// ── GET /api/audit-logs — Admin only ─────────────────────────
export const listAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));

    const where: any = {};
    if (req.query.entity) where.entity = req.query.entity;
    if (req.query.userId) where.userId = req.query.userId;
    if (req.query.action) where.action = req.query.action;
    if (req.query.fromDate || req.query.toDate) {
      where.createdAt = {};
      if (req.query.fromDate) where.createdAt.gte = new Date(req.query.fromDate as string);
      if (req.query.toDate) where.createdAt.lte = new Date(req.query.toDate as string);
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, fullName: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({ data, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('[listAuditLogs]', error);
    res.status(500).json({ error: 'Lỗi khi lấy nhật ký hệ thống' });
  }
};
