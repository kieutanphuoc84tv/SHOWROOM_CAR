import { prisma } from '../lib/prisma';

export async function logAudit(params: {
  userId?: string;
  action: string;   // CREATE | UPDATE | DELETE | LOGIN
  entity: string;   // Vehicle | Lead | Invoice …
  entityId?: string;
  details?: string;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({ data: params });
}
