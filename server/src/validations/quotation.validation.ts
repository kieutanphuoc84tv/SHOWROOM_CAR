import { z } from 'zod';

export const createQuotationSchema = z.object({
  vehicleId: z.string().uuid('ID xe không hợp lệ'),
  customerName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  customerEmail: z.string().email().optional().nullable(),
  vehiclePrice: z.coerce.number().positive(),
  registrationFee: z.coerce.number().min(0).optional().nullable(),
  insuranceFee: z.coerce.number().min(0).optional().nullable(),
  accessories: z.coerce.number().min(0).optional().nullable(),
  discount: z.coerce.number().min(0).optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateQuotationSchema = createQuotationSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
});
