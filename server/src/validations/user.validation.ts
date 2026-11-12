import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  role: z.enum(['ADMIN', 'SALES', 'USER']).optional(),
});

export const createUserByAdminSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ tên ít nhất 2 ký tự'),
  phone: z.string().min(10).optional().nullable(),
  role: z.enum(['ADMIN', 'SALES', 'USER']).default('SALES'),
});
