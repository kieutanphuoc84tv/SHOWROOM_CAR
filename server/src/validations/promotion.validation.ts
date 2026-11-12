import { z } from 'zod';

export const createPromotionSchema = z.object({
  title: z.string().min(5, 'Tiêu đề ít nhất 5 ký tự').max(300),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  discountType: z.enum(['PERCENTAGE', 'FIXED']),
  discountValue: z.coerce.number().positive('Giá trị giảm phải > 0'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().default(true),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] }
);

export const updatePromotionSchema = createPromotionSchema.partial();
