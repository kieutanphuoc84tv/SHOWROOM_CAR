import { z } from 'zod';

export const createLeadSchema = z.object({
  vehicleId: z.string().uuid().optional().nullable(),
  guestName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  guestPhone: z.string().min(10, 'Số điện thoại ít nhất 10 số'),
  guestEmail: z.string().email('Email không đúng định dạng').optional().nullable(),
  type: z.enum(['TEST_DRIVE', 'INQUIRY', 'FINANCE']),
  preferredDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED']).optional(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  preferredDate: z.string().datetime().optional().nullable(),
});

export const createInteractionSchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(['CALL', 'EMAIL', 'SMS', 'NOTE', 'MEETING']),
  content: z.string().min(1, 'Nội dung không được để trống').max(5000),
});
