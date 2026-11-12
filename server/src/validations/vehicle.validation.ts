import { z } from 'zod';

export const createVehicleSchema = z.object({
  vin: z.string().min(1).max(17).optional().nullable(),
  engineNumber: z.string().optional().nullable(),
  licensePlate: z.string().optional().nullable(),
  brandId: z.coerce.number().int().positive('Hãng xe không hợp lệ'),
  categoryId: z.coerce.number().int().positive('Phân khúc không hợp lệ'),
  model: z.string().min(1, 'Tên model là bắt buộc').max(100),
  trim: z.string().max(200).optional().nullable(),
  year: z.coerce.number().int().min(2000, 'Năm sản xuất >= 2000').max(2030),
  condition: z.enum(['NEW', 'USED']).default('NEW'),
  price: z.coerce.number().positive('Giá phải > 0'),
  costPrice: z.coerce.number().positive().optional().nullable(),
  mileage: z.coerce.number().int().min(0).default(0),
  fuelType: z.enum(['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID']),
  transmission: z.enum(['AUTOMATIC', 'MANUAL']),
  drivetrain: z.enum(['FWD', 'RWD', 'AWD', 'FOUR_WD']).optional().nullable(),
  color: z.string().min(1, 'Màu sắc là bắt buộc'),
  interiorColor: z.string().optional().nullable(),
  engine: z.string().optional().nullable(),
  seats: z.coerce.number().int().min(2).max(50).default(5),
  warrantyInfo: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']).default('AVAILABLE'),
  featured: z.coerce.boolean().default(false),
  images: z.array(z.object({
    imageUrl: z.string(),
    isPrimary: z.boolean().default(false),
    sortOrder: z.number().int().default(0),
  })).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  search: z.string().optional(),
  brandId: z.coerce.number().int().optional(),
  categoryId: z.coerce.number().int().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE']).optional(),
  condition: z.enum(['NEW', 'USED']).optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'year_desc', 'newest', 'oldest']).default('newest'),
});
