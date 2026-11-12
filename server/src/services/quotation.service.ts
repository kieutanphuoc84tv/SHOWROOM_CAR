import { prisma } from '../lib/prisma';

export function calculateTotal(data: {
  vehiclePrice: number;
  registrationFee?: number;
  insuranceFee?: number;
  accessories?: number;
  discount?: number;
}): number {
  const { vehiclePrice, registrationFee = 0, insuranceFee = 0, accessories = 0, discount = 0 } = data;
  return vehiclePrice + registrationFee + insuranceFee + accessories - discount;
}

export async function createQuotation(data: any, createdById?: string) {
  const totalAmount = calculateTotal(data);

  return prisma.quotation.create({
    data: { ...data, totalAmount, createdById, status: 'DRAFT' },
    include: { vehicle: true, createdBy: true },
  });
}
