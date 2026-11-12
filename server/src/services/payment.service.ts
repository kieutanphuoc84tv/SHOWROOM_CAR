import { prisma } from '../lib/prisma';

export async function recordPayment(data: any) {
  const payment = await prisma.payment.create({
    data: { ...data, status: 'PENDING' },
    include: { vehicle: true, invoice: true, deposit: true },
  });
  return payment;
}

export async function confirmPayment(id: string, transactionId?: string) {
  const payment = await prisma.payment.update({
    where: { id },
    data: { status: 'COMPLETED', paidAt: new Date(), transactionId },
    include: { invoice: true, deposit: true },
  });

  // Cập nhật Invoice → PAID
  if (payment.invoiceId) {
    await prisma.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: 'PAID' },
    });
  }
  // Cập nhật Deposit → CONFIRMED
  if (payment.depositId) {
    await prisma.deposit.update({
      where: { id: payment.depositId },
      data: { status: 'CONFIRMED' },
    });
  }

  return payment;
}
