import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import crypto from 'crypto';

const generateInvoiceNumber = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${y}${m}${d}-${rand}`;
};

export const getInvoices = async (_req: AuthRequest, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        vehicle: { include: { brand: true, category: true } },
        createdBy: { select: { id: true, fullName: true, email: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error: any) {
    console.error('[getInvoices]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách hóa đơn', details: error.message });
  }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId, customerName, customerPhone, customerEmail, customerAddress, subtotal, tax, notes } = req.body;
    if (!vehicleId || !customerName || !customerPhone || !subtotal) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin: Xe, Khách hàng, Số điện thoại và Tiền trước thuế' });
    }

    const sub = parseFloat(subtotal);
    const t = tax ? parseFloat(tax) : 0;
    if (isNaN(sub) || sub < 0) {
      return res.status(400).json({ error: 'Số tiền hóa đơn không hợp lệ' });
    }
    const totalAmount = sub + t;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        vehicleId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        customerAddress: customerAddress ? customerAddress.trim() : null,
        subtotal: sub,
        tax: t,
        totalAmount,
        notes: notes ? notes.trim() : null,
        status: 'DRAFT',
        createdById: req.user?.id || null,
      },
      include: {
        vehicle: { include: { brand: true } },
        createdBy: { select: { fullName: true } },
      },
    });

    res.status(201).json({ message: 'Tạo hóa đơn thành công', invoice });
  } catch (error: any) {
    console.error('[createInvoice]', error);
    res.status(500).json({ error: 'Lỗi khi tạo hóa đơn', details: error.message });
  }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, notes, subtotal, tax } = req.body;

    const data: any = {};
    if (status) {
      data.status = status;
      if (status === 'ISSUED') data.issuedAt = new Date();
    }
    if (notes !== undefined) data.notes = notes;
    if (subtotal !== undefined) {
      const sub = parseFloat(subtotal);
      const t = tax !== undefined ? parseFloat(tax) : 0;
      data.subtotal = sub;
      data.tax = t;
      data.totalAmount = sub + t;
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id },
        data,
        include: {
          vehicle: { include: { brand: true } },
          createdBy: { select: { fullName: true } },
        },
      });

      // Nếu hóa đơn chuyển sang PAID (đã thanh toán toàn bộ), tự động chuyển xe sang SOLD
      if (status === 'PAID') {
        await tx.vehicle.update({
          where: { id: updated.vehicleId },
          data: { status: 'SOLD' },
        });
      }

      return updated;
    });

    res.json({ message: 'Cập nhật hóa đơn thành công', invoice });
  } catch (error: any) {
    console.error('[updateInvoice]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật hóa đơn', details: error.message });
  }
};

export const deleteInvoice = async (_req: AuthRequest, res: Response) => {
  try {
    const id = String(_req.params.id);
    await prisma.invoice.delete({ where: { id } });
    res.json({ message: 'Xóa hóa đơn thành công' });
  } catch (error: any) {
    console.error('[deleteInvoice]', error);
    res.status(500).json({ error: 'Lỗi khi xóa hóa đơn', details: error.message });
  }
};
