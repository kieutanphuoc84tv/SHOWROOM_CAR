import { prisma } from '../lib/prisma';
import { notifyAdmins } from './notification.service';

export function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `INV-${y}${m}${d}-${rand}`;
}

export async function createInvoice(data: any, createdById?: string) {
  const invoiceNumber = data.invoiceNumber || generateInvoiceNumber();
  const tax = data.tax ?? Math.round(data.subtotal * 0.1);
  const totalAmount = data.subtotal + tax;

  const invoice = await prisma.invoice.create({
    data: { ...data, invoiceNumber, tax, totalAmount, createdById, status: 'DRAFT' },
    include: { vehicle: true, createdBy: true },
  });

  await notifyAdmins(
    'INVOICE',
    '📄 Hóa đơn mới',
    `Hóa đơn ${invoiceNumber} cho ${data.customerName}`,
    '/admin/invoices'
  );

  return invoice;
}
