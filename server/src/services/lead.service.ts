import { prisma } from '../lib/prisma';
import { notifySales } from './notification.service';

let roundRobinIndex = 0;

export async function autoAssignSales(): Promise<string | null> {
  const salesUsers = await prisma.user.findMany({
    where: { role: 'SALES', isActive: true },
    select: { id: true },
    orderBy: { fullName: 'asc' },
  });
  if (salesUsers.length === 0) return null;
  const assigned = salesUsers[roundRobinIndex % salesUsers.length];
  roundRobinIndex++;
  return assigned.id;
}

export async function createLeadWithAutoAssign(data: any, vehicleId?: string) {
  let assignedToId = data.assignedToId ?? null;
  if (!assignedToId) {
    assignedToId = await autoAssignSales();
  }

  const lead = await prisma.lead.create({
    data: { ...data, assignedToId },
    include: { vehicle: true, assignedTo: true },
  });

  if (assignedToId) {
    await notifySales(
      assignedToId,
      'LEAD',
      '🔔 Lead mới được phân công',
      `Khách hàng ${data.guestName} quan tâm ${lead.vehicle?.model ?? 'chung'}`,
      '/admin/leads'
    );
  }

  return lead;
}
