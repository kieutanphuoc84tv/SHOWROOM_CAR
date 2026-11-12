import { z } from 'zod';

export const createTestDriveSchema = z.object({
  vehicleId: z.string().uuid('ID xe không hợp lệ'),
  customerName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  customerPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  customerEmail: z.string().email().optional().nullable(),
  scheduledDate: z.string().refine(
    (val) => new Date(val) >= new Date(new Date().toDateString()),
    'Ngày hẹn phải từ hôm nay trở đi'
  ),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, 'Định dạng HH:MM'),
  notes: z.string().max(2000).optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const updateTestDriveSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().max(2000).optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});
