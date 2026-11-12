import type { Vehicle } from './vehicle';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: 'ADMIN' | 'SALES' | 'USER';
  isActive: boolean;
  createdAt?: string;
}

export interface Lead {
  id: string;
  _id?: string;
  vehicleId?: string | null;
  customerId?: string | null;
  assignedToId?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  guestEmail?: string | null;
  type: 'TEST_DRIVE' | 'INQUIRY' | 'FINANCE';
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST' | 'CONVERTED';
  preferredDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
  assignedTo?: User | null;
}

export interface TestDrive {
  id: string;
  _id?: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
  assignedTo?: User | null;
}

export interface Deposit {
  id: string;
  _id?: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  amount: number | string;
  status: 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'REFUNDED';
  expiresAt?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
  createdBy?: { id?: string; fullName?: string; email?: string } | null;
}

export interface Quotation {
  id: string;
  _id?: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  vehiclePrice: number | string;
  registrationFee?: number | string | null;
  insuranceFee?: number | string | null;
  accessories?: number | string | null;
  discount?: number | string | null;
  totalAmount: number | string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  validUntil?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
  createdBy?: { id?: string; fullName?: string; email?: string } | null;
}

export interface Invoice {
  id: string;
  _id?: string;
  invoiceNumber: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  subtotal: number | string;
  tax?: number | string | null;
  totalAmount: number | string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';
  issuedAt?: string | null;
  notes?: string | null;
  createdById?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
  createdBy?: { id?: string; fullName?: string; email?: string } | null;
}

export interface Payment {
  id: string;
  _id?: string;
  vehicleId: string;
  invoiceId?: string | null;
  depositId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  amount: number | string;
  method: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'INSTALLMENT';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string | null;
  notes?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
  invoice?: { id: string; invoiceNumber: string; totalAmount: number | string } | null;
  deposit?: { id: string; amount: number | string; status: string } | null;
}

export interface FinanceApplication {
  id: string;
  _id?: string;
  vehicleId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  monthlyIncome?: number | string | null;
  loanAmount: number | string;
  loanTermMonths: number;
  interestRate?: number | string | null;
  downPayment?: number | string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED';
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;

  vehicle?: Vehicle | null;
}
