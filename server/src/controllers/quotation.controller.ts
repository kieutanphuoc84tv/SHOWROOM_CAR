import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getQuotations = async (_req: AuthRequest, res: Response) => {
  try {
    const quotations = await prisma.quotation.findMany({
      include: {
        vehicle: { include: { brand: true, category: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(quotations);
  } catch (error: any) {
    console.error('[getQuotations]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách báo giá', details: error.message });
  }
};

export const createQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const {
      vehicleId,
      customerName,
      customerPhone,
      customerEmail,
      vehiclePrice,
      registrationFee,
      insuranceFee,
      accessories,
      discount,
      validUntil,
      notes,
    } = req.body;

    if (!vehicleId || !customerName || !customerPhone || !vehiclePrice) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ: Xe, Khách hàng, Số điện thoại và Giá xe' });
    }

    const vp = parseFloat(vehiclePrice);
    const rf = registrationFee ? parseFloat(registrationFee) : 0;
    const inf = insuranceFee ? parseFloat(insuranceFee) : 0;
    const acc = accessories ? parseFloat(accessories) : 0;
    const disc = discount ? parseFloat(discount) : 0;
    const totalAmount = Math.max(0, vp + rf + inf + acc - disc);

    const quotation = await prisma.quotation.create({
      data: {
        vehicleId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        vehiclePrice: vp,
        registrationFee: rf,
        insuranceFee: inf,
        accessories: acc,
        discount: disc,
        totalAmount,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Mặc định hiệu lực 15 ngày
        notes: notes ? notes.trim() : null,
        status: 'DRAFT',
        createdById: req.user?.id || null,
      },
      include: {
        vehicle: { include: { brand: true } },
        createdBy: { select: { fullName: true } },
      },
    });

    res.status(201).json({ message: 'Tạo bảng báo giá thành công', quotation });
  } catch (error: any) {
    console.error('[createQuotation]', error);
    res.status(500).json({ error: 'Lỗi khi tạo báo giá', details: error.message });
  }
};

export const updateQuotation = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, notes, vehiclePrice, registrationFee, insuranceFee, accessories, discount, validUntil } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (validUntil) data.validUntil = new Date(validUntil);

    if (vehiclePrice !== undefined) {
      const current = await prisma.quotation.findUnique({ where: { id } });
      if (current) {
        const vp = parseFloat(vehiclePrice);
        const rf = registrationFee !== undefined ? parseFloat(registrationFee) : Number(current.registrationFee || 0);
        const inf = insuranceFee !== undefined ? parseFloat(insuranceFee) : Number(current.insuranceFee || 0);
        const acc = accessories !== undefined ? parseFloat(accessories) : Number(current.accessories || 0);
        const disc = discount !== undefined ? parseFloat(discount) : Number(current.discount || 0);

        data.vehiclePrice = vp;
        data.registrationFee = rf;
        data.insuranceFee = inf;
        data.accessories = acc;
        data.discount = disc;
        data.totalAmount = Math.max(0, vp + rf + inf + acc - disc);
      }
    }

    const quotation = await prisma.quotation.update({
      where: { id },
      data,
      include: {
        vehicle: { include: { brand: true } },
        createdBy: { select: { fullName: true } },
      },
    });

    res.json({ message: 'Cập nhật báo giá thành công', quotation });
  } catch (error: any) {
    console.error('[updateQuotation]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật báo giá', details: error.message });
  }
};

export const deleteQuotation = async (_req: AuthRequest, res: Response) => {
  try {
    const id = String(_req.params.id);
    await prisma.quotation.delete({ where: { id } });
    res.json({ message: 'Xóa báo giá thành công' });
  } catch (error: any) {
    console.error('[deleteQuotation]', error);
    res.status(500).json({ error: 'Lỗi khi xóa báo giá', details: error.message });
  }
};
