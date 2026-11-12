import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createLead = async (req: Request, res: Response) => {
  try {
    const { guestName, guestPhone, guestEmail, type, vehicleId, notes } = req.body;
    if (!guestName || !guestPhone || !type) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (Tên, SĐT, Loại tư vấn)' });
    }
    const lead = await prisma.lead.create({
      data: {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail ? guestEmail.trim() : null,
        type,
        notes: notes ? notes.trim() : null,
        vehicleId: vehicleId || null,
        status: 'NEW',
      },
    });
    res.status(201).json({ message: 'Gửi yêu cầu thành công!', lead });
  } catch (error) {
    console.error('[createLead]', error);
    res.status(500).json({ error: 'Lỗi server khi tạo Lead' });
  }
};

export const getLeads = async (_req: Request, res: Response) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { vehicle: { include: { brand: true } }, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (error) {
    console.error('[getLeads]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách leads' });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, assignedToId, notes } = req.body;
    const lead = await prisma.lead.update({
      where: { id },
      data: { status, assignedToId: assignedToId || null, notes },
    });
    res.json({ message: 'Cập nhật lead thành công', lead });
  } catch (error) {
    console.error('[updateLead]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật lead' });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.lead.delete({ where: { id } });
    res.json({ message: 'Xóa lead thành công' });
  } catch (error) {
    console.error('[deleteLead]', error);
    res.status(500).json({ error: 'Lỗi khi xóa lead' });
  }
};
