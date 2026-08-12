import { type CUID } from '@/shared';

export type PayrollStatusDto = 'DRAFT' | 'APPROVED' | 'PAID';
export type PayrollRunStatusDto = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PAID' | 'CANCELLED';
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

export type PayslipEmailStatusDto = 'NOT_SENT' | 'PENDING' | 'SENT' | 'FAILED';

export type PayslipDto = {
  id: CUID;
  payrollRunId?: CUID | null;
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
  emailStatus?: PayslipEmailStatusDto;
  emailedAt?: Date | null;
  emailError?: string | null;
  paidAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: PayslipItemDto[];
  employee?: {
    id: CUID;
    firstName: string;
    lastName: string;
    workEmail?: string;
    role: string | null;
    avatarId: string | null;
  };
};

export type PayrollRunDto = {
  id: CUID;
  name: string;
  periodStart: Date;
  periodEnd: Date;
  status: PayrollRunStatusDto;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  totalPayslips: number;
  approvedById?: string | null;
  paidAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  payslips?: PayslipDto[];
};

export type GeneratePayrollRunDto = {
  name?: string;
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
  runs?: PayrollRunDto[];
  page: number;
  perPage: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
};
