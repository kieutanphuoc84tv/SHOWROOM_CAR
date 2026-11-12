import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function backup() {
  try {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const data = {
      timestamp: new Date().toISOString(),
      database: 'Neon PostgreSQL (neondb)',
      users: await prisma.user.findMany(),
      brands: await prisma.brand.findMany(),
      categories: await prisma.category.findMany(),
      vehicles: await prisma.vehicle.findMany({ include: { images: true } }),
      leads: await prisma.lead.findMany(),
      testDrives: await prisma.testDrive.findMany(),
      financeApplications: await prisma.financeApplication.findMany(),
      payments: await prisma.payment.findMany(),
      deposits: await prisma.deposit.findMany(),
      quotations: await prisma.quotation.findMany(),
      invoices: await prisma.invoice.findMany(),
    };

    const filePath = path.join(backupDir, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('✅ BACKUP_SUCCESS:', filePath);
  } catch (error: any) {
    console.error('❌ BACKUP_ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

backup();

