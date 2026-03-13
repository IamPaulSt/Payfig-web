export type LoanStatus = 'ACTIVE' | 'PAID' | 'OVERDUE';
export type PaymentFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type InstallmentStatus = 'PENDING' | 'PAID';
export type PaymentType = 'FULL_INSTALLMENT' | 'INTEREST_ONLY' | 'EXCESS_PAYMENT' | 'FULL_LIQUIDATION';

export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  interestAmount: number;
  dueDate: string;
  status: InstallmentStatus;
}

export interface Loan {
  id: number;
  amount: number;
  interestRate: number;
  totalToPay: number;
  installmentsCount: number;
  frequency: PaymentFrequency;
  startDate: string;
  status: LoanStatus;
  customer: Customer;
  admin: User;
  installments?: Installment[];
}

export interface CashSummary {
  moneyInTheStreet: number;
  monthlyCollections: number;
  totalLent: number;
  activeLoansCount: number;
}

export interface OverdueReportItem {
  loanId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  installmentNumber: number;
  overdueAmount: number;
  dueDate: string;
  daysOverdue: number;
}
export interface CollectionAgendaItem {
  loanId: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  installmentNumber: number;
  amountToCollect: number;
  interestAmount: number;
  totalLiquidation: number;
  dueDate: string;
  isOverdue: boolean;
}
export interface LoanRequest {
  customerId: number;
  amount: number;
  interestRate: number;
  installmentsCount: number;
  frequency: PaymentFrequency;
  startDate?: string;
}

export type ExcessTarget = 'NEXT' | 'LAST';

export interface PaymentRequest {
  loanId: number;
  amount: number;
  type: PaymentType;
  excessTarget: ExcessTarget;
  paymentDate?: string;
}
