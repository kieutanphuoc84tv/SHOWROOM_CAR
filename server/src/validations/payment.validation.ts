import { z } from 'zod';

export const createPaymentSchema = z.object({
  vehicleId: z.string().uuid('ID xe không hợp lệ'),
  invoiceId: z.string().uuid().optional().nullable(),
  depositId: z.string().uuid().optional().nullable(),
  customerName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  customerEmail: z.string().email().optional().nullable(),
  amount: z.coerce.number().positive('Số tiền phải > 0'),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'INSTALLMENT']),
  transactionId: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
  transactionId: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});
