import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logAudit } from '../services/audit.service';

// ── GET /api/promotions — Public list ────────────────────────
export const listPromotions = async (req: Request, res: Response) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
      where.startDate = { lte: new Date() };
      where.endDate = { gte: new Date() };
    }

    const data = await prisma.promotion.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(data);
  } catch (error) {
    console.error('[listPromotions]', error);
    res.status(500).json({ error: 'Lỗi khi lấy khuyến mãi' });
  }
};

// ── GET /api/promotions/:id ──────────────────────────────────
export const getPromotion = async (req: Request, res: Response) => {
  try {
    const promo = await prisma.promotion.findUnique({ where: { id: req.params.id } });
    if (!promo) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi' });
    res.json(promo);
  } catch (error) {
    console.error('[getPromotion]', error);
    res.status(500).json({ error: 'Lỗi khi lấy khuyến mãi' });
  }
};

// ── POST /api/promotions — Admin ─────────────────────────────
export const createPromotion = async (req: AuthRequest, res: Response) => {
  try {
    const promo = await prisma.promotion.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      },
    });
    await logAudit({ userId: req.user!.id, action: 'CREATE', entity: 'Promotion', entityId: promo.id });
    res.status(201).json(promo);
  } catch (error) {
    console.error('[createPromotion]', error);
    res.status(500).json({ error: 'Lỗi khi tạo khuyến mãi' });
  }
};

// ── PUT /api/promotions/:id — Admin ──────────────────────────
export const updatePromotion = async (req: AuthRequest, res: Response) => {
  try {
    const data: any = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const promo = await prisma.promotion.update({ where: { id: req.params.id }, data });
    await logAudit({ userId: req.user!.id, action: 'UPDATE', entity: 'Promotion', entityId: promo.id });
    res.json(promo);
  } catch (error) {
    console.error('[updatePromotion]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật khuyến mãi' });
  }
};

// ── DELETE /api/promotions/:id — Admin ───────────────────────
export const deletePromotion = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    await logAudit({ userId: req.user!.id, action: 'DELETE', entity: 'Promotion', entityId: req.params.id });
    res.json({ message: 'Đã xóa khuyến mãi' });
  } catch (error) {
    console.error('[deletePromotion]', error);
    res.status(500).json({ error: 'Lỗi khi xóa khuyến mãi' });
  }
};
