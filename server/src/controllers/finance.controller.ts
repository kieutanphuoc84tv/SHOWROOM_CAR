import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getFinanceApplications = async (_req: Request, res: Response) => {
  try {
    const apps = await prisma.financeApplication.findMany({
      include: { vehicle: { include: { brand: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(apps);
  } catch (error) {
    console.error('[getFinanceApplications]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách hồ sơ trả góp' });
  }
};

export const createFinanceApplication = async (req: Request, res: Response) => {
  try {
    const { vehicleId, customerName, customerPhone, customerEmail, monthlyIncome, loanAmount, loanTermMonths, interestRate, downPayment, notes } = req.body;
    if (!vehicleId || !customerName || !customerPhone || !loanAmount || !loanTermMonths) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    const app = await prisma.financeApplication.create({
      data: {
        vehicleId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
        loanAmount: parseFloat(loanAmount),
        loanTermMonths: parseInt(loanTermMonths),
        interestRate: interestRate ? parseFloat(interestRate) : null,
        downPayment: downPayment ? parseFloat(downPayment) : null,
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
      },
    });
    res.status(201).json({ message: 'Gửi hồ sơ trả góp thành công!', app });
  } catch (error) {
    console.error('[createFinanceApplication]', error);
    res.status(500).json({ error: 'Lỗi khi tạo hồ sơ trả góp' });
  }
};

export const updateFinanceApplication = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, interestRate, notes } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (interestRate !== undefined) data.interestRate = parseFloat(interestRate);
    if (notes !== undefined) data.notes = notes;
    const app = await prisma.financeApplication.update({ where: { id }, data });
    res.json({ message: 'Cập nhật hồ sơ trả góp thành công', app });
  } catch (error) {
    console.error('[updateFinanceApplication]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật hồ sơ trả góp' });
  }
};

export const deleteFinanceApplication = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.financeApplication.delete({ where: { id } });
    res.json({ message: 'Xóa hồ sơ trả góp thành công' });
  } catch (error) {
    console.error('[deleteFinanceApplication]', error);
    res.status(500).json({ error: 'Lỗi khi xóa hồ sơ trả góp' });
  }
};
