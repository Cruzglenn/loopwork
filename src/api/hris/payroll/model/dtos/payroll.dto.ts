import { type CUID } from '@/shared';

export type PayrollStatusDto = 'DRAFT' | 'APPROVED' | 'PAID';
export type PayPeriodDto = 'WEEKLY' | 'BIWEEKLY' | 'SEMIMONTHLY' | 'MONTHLY';
export type PayslipItemTypeDto = 'ALLOWANCE' | 'DEDUCTION';

export type EmployeeSalaryConfigDto = {
  id: CUID;
  employeeId: CUID;
  baseSalary: number;
  payPeriod: PayPeriodDto;
  hourlyRate: number | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PayslipItemDto = {
  id: CUID;
  payslipId: CUID;
  name: string;
  type: PayslipItemTypeDto;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PayslipDto = {
  id: CUID;
  employeeId: CUID;
  periodStart: Date;
  periodEnd: Date;
  basicPay: number;
  overtimePay: number;
  allowancesTotal: number;
  deductionsTotal: number;
  grossPay: number;
  netPay: number;
  status: PayrollStatusDto;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: PayslipItemDto[];
  employee?: {
    id: CUID;
    firstName: string;
    lastName: string;
    role: string | null;
    avatarId: string | null;
  };
};

export type GeneratePayrollRunDto = {
  periodStart: Date;
  periodEnd: Date;
  employeeIds?: CUID[];
  notes?: string;
};

export type UpdateSalaryConfigDto = {
  employeeId: CUID;
  baseSalary: number;
  payPeriod?: PayPeriodDto;
  hourlyRate?: number;
  currency?: string;
};

export type CompanyPayrollOverviewDto = {
  periodStart: Date;
  periodEnd: Date;
  totalPayslips: number;
  totalGrossPay: number;
  totalNetPay: number;
  totalDeductions: number;
  payslips: PayslipDto[];
  page: number;
  perPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
};
