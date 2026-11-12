import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const [totalVehicles, availableVehicles, soldVehicles, reservedVehicles,
           totalLeads, newLeads, convertedLeads,
           totalTestDrives, pendingTestDrives,
           totalFinance, pendingFinance,
           totalPayments, completedPayments, totalRevenue,
           totalDeposits, pendingDeposits,
           totalQuotations, draftQuotations,
           totalInvoices, paidInvoices] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.vehicle.count({ where: { status: 'SOLD' } }),
      prisma.vehicle.count({ where: { status: 'RESERVED' } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.lead.count({ where: { status: 'CONVERTED' } }),
      prisma.testDrive.count(),
      prisma.testDrive.count({ where: { status: 'PENDING' } }),
      prisma.financeApplication.count(),
      prisma.financeApplication.count({ where: { status: 'PENDING' } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
      prisma.deposit.count(),
      prisma.deposit.count({ where: { status: 'PENDING' } }),
      prisma.quotation.count(),
      prisma.quotation.count({ where: { status: 'DRAFT' } }),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'PAID' } }),
    ]);

    const recentLeads = await prisma.lead.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: { 
        vehicle: { include: { brand: true } },
        customer: { select: { fullName: true, phone: true } },
      },
    });

    const recentTestDrives = await prisma.testDrive.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: { vehicle: { include: { brand: true } } },
    });

    res.json({
      vehicles: { total: totalVehicles, available: availableVehicles, sold: soldVehicles, reserved: reservedVehicles },
      leads: { total: totalLeads, new: newLeads, converted: convertedLeads },
      testDrives: { total: totalTestDrives, pending: pendingTestDrives },
      finance: { total: totalFinance, pending: pendingFinance },
      payments: { total: totalPayments, completed: completedPayments, totalRevenue: totalRevenue._sum.amount || 0 },
      deposits: { total: totalDeposits, pending: pendingDeposits },
      quotations: { total: totalQuotations, draft: draftQuotations },
      invoices: { total: totalInvoices, paid: paidInvoices },
      recentLeads,
      recentTestDrives,
    });
  } catch (error: any) {
    console.error('[getDashboardStats]', error);
    res.status(500).json({ error: 'Lỗi server khi lấy thống kê dashboard' });
  }
};
