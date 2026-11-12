import { z } from 'zod';

export const createDepositSchema = z.object({
  vehicleId: z.string().uuid('ID xe không hợp lệ'),
  customerName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  customerEmail: z.string().email().optional().nullable(),
  amount: z.coerce.number().positive('Số tiền cọc phải > 0'),
  expiresAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateDepositStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'EXPIRED', 'REFUNDED']),
  notes: z.string().max(2000).optional().nullable(),
});
