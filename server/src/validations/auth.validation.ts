import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email không đúng định dạng').min(1, 'Email là bắt buộc'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const registerUserSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional().nullable(),
  role: z.enum(['ADMIN', 'SALES', 'USER']).default('SALES'),
});

