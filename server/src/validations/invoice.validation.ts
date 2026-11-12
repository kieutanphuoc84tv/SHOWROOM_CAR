import { z } from 'zod';

export const createInvoiceSchema = z.object({
  vehicleId: z.string().uuid('ID xe không hợp lệ'),
  customerName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  customerEmail: z.string().email().optional().nullable(),
  customerAddress: z.string().max(500).optional().nullable(),
  subtotal: z.coerce.number().positive('Tổng tiền hàng phải > 0'),
  tax: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ISSUED', 'PAID', 'CANCELLED']),
  notes: z.string().max(2000).optional().nullable(),
});
