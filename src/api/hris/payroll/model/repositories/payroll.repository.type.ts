import { type CUID } from '@/shared';
import {
  type EmployeeSalaryConfigDto,
  type PayslipDto,
  type PayrollRunDto,
  type PayrollStatusDto,
  type PayrollRunStatusDto,
  type UpdateSalaryConfigDto,
} from '../dtos/payroll.dto';

export type PayrollRepository = {
  upsertSalaryConfig: (dto: UpdateSalaryConfigDto) => Promise<EmployeeSalaryConfigDto>;
  findSalaryConfigByEmployeeId: (employeeId: CUID) => Promise<EmployeeSalaryConfigDto | null>;

  createPayrollRun: (data: {
    name: string;
    periodStart: Date;
    periodEnd: Date;
    notes?: string;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    totalPayslips: number;
  }) => Promise<PayrollRunDto>;

  updatePayrollRunStatus: (
    id: CUID,
    status: PayrollRunStatusDto,
    approvedById?: string,
    paidAt?: Date,
  ) => Promise<PayrollRunDto>;

  findPayrollRunById: (id: CUID) => Promise<PayrollRunDto | null>;
  getAllPayrollRuns: () => Promise<PayrollRunDto[]>;

  createPayslip: (data: {
    payrollRunId?: CUID;
    employeeId: CUID;
    periodStart: Date;
    periodEnd: Date;
    basicPay: number;
    overtimePay: number;
    allowancesTotal: number;
    deductionsTotal: number;
    grossPay: number;
    netPay: number;
    notes?: string;
    items: Array<{ name: string; type: 'ALLOWANCE' | 'DEDUCTION'; amount: number }>;
  }) => Promise<PayslipDto>;

  updatePayslipStatus: (id: CUID, status: PayrollStatusDto, paidAt?: Date) => Promise<PayslipDto>;
  findPayslipById: (id: CUID) => Promise<PayslipDto | null>;
  findPayslipsByEmployeeId: (employeeId: CUID) => Promise<PayslipDto[]>;
  deletePayslip: (id: CUID) => Promise<void>;
};
