import { z } from 'zod';

export const createBlogPostSchema = z.object({
  title: z.string().min(5, 'Tiêu đề ít nhất 5 ký tự').max(300),
  slug: z.string().min(5).max(300).regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  content: z.string().min(50, 'Nội dung ít nhất 50 ký tự'),
  excerpt: z.string().max(500).optional().nullable(),
  coverImage: z.string().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();
