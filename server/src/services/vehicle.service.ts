import { prisma } from '../lib/prisma';
import type { Prisma } from '../generated/client';

export interface VehicleFilter {
  page: number;
  limit: number;
  search?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  condition?: string;
  featured?: boolean;
  sort: string;
}

export function buildVehicleWhere(f: VehicleFilter): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = { isDeleted: false };

  if (f.search) {
    where.OR = [
      { model: { contains: f.search, mode: 'insensitive' } },
      { trim: { contains: f.search, mode: 'insensitive' } },
      { description: { contains: f.search, mode: 'insensitive' } },
      { brand: { name: { contains: f.search, mode: 'insensitive' } } },
    ];
  }
  if (f.brandId) where.brandId = f.brandId;
  if (f.categoryId) where.categoryId = f.categoryId;
  if (f.status) where.status = f.status as any;
  if (f.condition) where.condition = f.condition as any;
  if (f.featured !== undefined) where.featured = f.featured;
  if (f.minPrice || f.maxPrice) {
    where.price = {};
    if (f.minPrice) where.price.gte = f.minPrice;
    if (f.maxPrice) where.price.lte = f.maxPrice;
  }
  return where;
}

export function buildVehicleOrderBy(sort: string): Prisma.VehicleOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc':  return { price: 'asc' };
    case 'price_desc': return { price: 'desc' };
    case 'year_desc':  return { year: 'desc' };
    case 'oldest':     return { createdAt: 'asc' };
    default:           return { createdAt: 'desc' };
  }
}

export async function softDeleteVehicle(id: string) {
  return prisma.vehicle.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
}
