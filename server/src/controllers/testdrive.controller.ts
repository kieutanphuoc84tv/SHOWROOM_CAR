import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getTestDrives = async (_req: Request, res: Response) => {
  try {
    const testDrives = await prisma.testDrive.findMany({
      include: { vehicle: { include: { brand: true, images: true } }, assignedTo: true },
      orderBy: { scheduledDate: 'desc' },
    });
    res.json(testDrives);
  } catch (error) {
    console.error('[getTestDrives]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách lái thử' });
  }
};

export const createTestDrive = async (req: Request, res: Response) => {
  try {
    const { vehicleId, customerName, customerPhone, customerEmail, scheduledDate, scheduledTime, notes } = req.body;
    if (!vehicleId || !customerName || !customerPhone || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    const testDrive = await prisma.testDrive.create({
      data: {
        vehicleId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail ? customerEmail.trim() : null,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        notes: notes ? notes.trim() : null,
        status: 'PENDING',
      },
    });
    res.status(201).json({ message: 'Đặt lịch lái thử thành công!', testDrive });
  } catch (error) {
    console.error('[createTestDrive]', error);
    res.status(500).json({ error: 'Lỗi khi đặt lịch lái thử' });
  }
};

export const updateTestDrive = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, assignedToId, notes, scheduledDate, scheduledTime } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (assignedToId !== undefined) data.assignedToId = assignedToId || null;
    if (notes !== undefined) data.notes = notes;
    if (scheduledDate) data.scheduledDate = new Date(scheduledDate);
    if (scheduledTime) data.scheduledTime = scheduledTime;
    const testDrive = await prisma.testDrive.update({ where: { id }, data });
    res.json({ message: 'Cập nhật lịch lái thử thành công', testDrive });
  } catch (error) {
    console.error('[updateTestDrive]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật lịch lái thử' });
  }
};

export const deleteTestDrive = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.testDrive.delete({ where: { id } });
    res.json({ message: 'Xóa lịch lái thử thành công' });
  } catch (error) {
    console.error('[deleteTestDrive]', error);
    res.status(500).json({ error: 'Lỗi khi xóa lịch lái thử' });
  }
};
