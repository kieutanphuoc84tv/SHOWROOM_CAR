import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDeposits = async (_req: AuthRequest, res: Response) => {
  try {
    const deposits = await prisma.deposit.findMany({
      include: {
        vehicle: {
          include: { brand: true, category: true },
        },
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(deposits);
  } catch (error: any) {
    console.error('[getDeposits]', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách đặt cọc', details: error.message });
  }
};

export const createDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const { vehicleId, customerName, customerPhone, customerEmail, amount, expiresAt, notes } = req.body;
    if (!vehicleId || !customerName || !customerPhone || !amount) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ: Xe, Tên khách hàng, Số điện thoại và Số tiền cọc' });
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ error: 'Số tiền đặt cọc không hợp lệ' });
    }

    // Thực hiện trong Transaction an toàn: Kiểm tra xe có AVAILABLE hay không trước khi cọc
    const result = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (!vehicle || vehicle.isDeleted) {
        throw new Error('Xe không tồn tại hoặc đã ngừng kinh doanh');
      }

      if (vehicle.status === 'SOLD') {
        throw new Error('Xe này đã được bán hoàn tất, không thể nhận cọc');
      }

      if (vehicle.status === 'RESERVED') {
        throw new Error('Xe này hiện đang được giữ cọc cho một khách hàng khác');
      }

      const deposit = await tx.deposit.create({
        data: {
          vehicleId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail ? customerEmail.trim() : null,
          amount: depositAmount,
          expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Mặc định giữ chỗ 7 ngày
          notes: notes ? notes.trim() : null,
          status: 'PENDING',
          createdById: req.user?.id || null,
        },
        include: {
          vehicle: { include: { brand: true } },
          createdBy: { select: { fullName: true } },
        },
      });

      // Cập nhật trạng thái xe sang RESERVED
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: 'RESERVED' },
      });

      return deposit;
    });

    res.status(201).json({ message: 'Tạo phiếu đặt cọc thành công', deposit: result });
  } catch (error: any) {
    console.error('[createDeposit]', error);
    res.status(400).json({ error: error.message || 'Lỗi khi tạo đặt cọc' });
  }
};

export const updateDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status, notes, expiresAt } = req.body;

    const currentDeposit = await prisma.deposit.findUnique({ where: { id } });
    if (!currentDeposit) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu đặt cọc' });
    }

    const data: any = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (expiresAt) data.expiresAt = new Date(expiresAt);

    const updated = await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.update({
        where: { id },
        data,
        include: {
          vehicle: { include: { brand: true } },
          createdBy: { select: { fullName: true } },
        },
      });

      // Nếu phiếu cọc bị Hủy (EXPIRED hoặc REFUNDED), kiểm tra và giải phóng xe về AVAILABLE
      if (['EXPIRED', 'REFUNDED'].includes(status)) {
        const otherActiveDeposit = await tx.deposit.findFirst({
          where: {
            vehicleId: currentDeposit.vehicleId,
            id: { not: id },
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        });

        if (!otherActiveDeposit) {
          await tx.vehicle.update({
            where: { id: currentDeposit.vehicleId },
            data: { status: 'AVAILABLE' },
          });
        }
      } else if (['PENDING', 'CONFIRMED'].includes(status)) {
        await tx.vehicle.update({
          where: { id: currentDeposit.vehicleId },
          data: { status: 'RESERVED' },
        });
      }

      return deposit;
    });

    res.json({ message: 'Cập nhật phiếu đặt cọc thành công', deposit: updated });
  } catch (error: any) {
    console.error('[updateDeposit]', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật đặt cọc', details: error.message });
  }
};

export const deleteDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);

    const deposit = await prisma.deposit.findUnique({ where: { id } });
    if (!deposit) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu đặt cọc' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.deposit.delete({ where: { id } });

      // Nếu xóa cọc đang hoạt động, hoàn trả trạng thái xe về AVAILABLE nếu không còn cọc nào khác
      if (['PENDING', 'CONFIRMED'].includes(deposit.status)) {
        const otherActiveDeposit = await tx.deposit.findFirst({
          where: {
            vehicleId: deposit.vehicleId,
            status: { in: ['PENDING', 'CONFIRMED'] },
          },
        });

        if (!otherActiveDeposit) {
          await tx.vehicle.update({
            where: { id: deposit.vehicleId },
            data: { status: 'AVAILABLE' },
          });
        }
      }
    });

    res.json({ message: 'Xóa phiếu đặt cọc thành công' });
  } catch (error: any) {
    console.error('[deleteDeposit]', error);
    res.status(500).json({ error: 'Lỗi khi xóa đặt cọc', details: error.message });
  }
};
