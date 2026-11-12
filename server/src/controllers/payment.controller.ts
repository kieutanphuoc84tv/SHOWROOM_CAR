import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getPayments = async (_req: AuthRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        vehicle: { include: { brand: true, category: true } },
        invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
        deposit: { select: { id: true, amount: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (error: any) {
    console.error('[getPayments]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thanh toán', details: error.message });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId, invoiceId, depositId, customerName, customerPhone, customerEmail, amount, method, transactionId, notes } = req.body;
    if (!vehicleId || !customerName || !customerPhone || !amount || !method) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ: Xe, Khách hàng, Số điện thoại, Số tiền và Phương thức thanh toán' });
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return res.status(400).json({ error: 'Số tiền thanh toán không hợp lệ' });
    }

    const payment = await prisma.payment.create({
      data: {
        vehicleId,
        invoiceId: invoiceId || null,
        depositId: depositId || null,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        amount: payAmount,
        method,
        transactionId: transactionId ? transactionId.trim() : null,
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
      },
      include: {
        vehicle: { include: { brand: true } },
        invoice: true,
        deposit: true,
      },
    });

    res.status(201).json({ message: 'Tạo giao dịch thanh toán thành công', payment });
  } catch (error: any) {
    console.error('[createPayment]', error);
    res.status(500).json({ error: 'Lỗi khi tạo thanh toán', details: error.message });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, transactionId, notes, paidAt } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (transactionId !== undefined) data.transactionId = transactionId;
    if (notes !== undefined) data.notes = notes;
    if (paidAt) data.paidAt = new Date(paidAt);
    if (status === 'COMPLETED' && !paidAt) data.paidAt = new Date();

    const payment = await prisma.payment.update({
      where: { id },
      data,
      include: {
        vehicle: { include: { brand: true } },
      },
    });

    res.json({ message: 'Cập nhật thanh toán thành công', payment });
  } catch (error: any) {
    console.error('[updatePayment]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật thanh toán', details: error.message });
  }
};

export const deletePayment = async (_req: AuthRequest, res: Response) => {
  try {
    const id = String(_req.params.id);
    await prisma.payment.delete({ where: { id } });
    res.json({ message: 'Xóa giao dịch thanh toán thành công' });
  } catch (error: any) {
    console.error('[deletePayment]', error);
    res.status(500).json({ error: 'Lỗi khi xóa thanh toán', details: error.message });
  }
};
