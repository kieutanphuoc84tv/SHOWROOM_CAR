import { z } from 'zod';

export const createFinanceSchema = z.object({
  vehicleId: z.string().uuid('ID xe không hợp lệ'),
  customerName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  customerEmail: z.string().email().optional().nullable(),
  monthlyIncome: z.coerce.number().positive().optional().nullable(),
  loanAmount: z.coerce.number().positive('Số tiền vay phải > 0'),
  loanTermMonths: z.coerce.number().int().min(6, 'Tối thiểu 6 tháng').max(96, 'Tối đa 96 tháng'),
  interestRate: z.coerce.number().min(0).max(30).optional().nullable(),
  downPayment: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateFinanceSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED']).optional(),
  interestRate: z.coerce.number().min(0).max(30).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});
