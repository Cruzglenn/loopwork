import { type CUID } from '@/shared';
import {
  type EmployeeSalaryConfigDto,
  type PayslipDto,
  type PayrollStatusDto,
  type UpdateSalaryConfigDto,
} from '../dtos/payroll.dto';

export type PayrollRepository = {
  upsertSalaryConfig: (dto: UpdateSalaryConfigDto) => Promise<EmployeeSalaryConfigDto>;
  findSalaryConfigByEmployeeId: (employeeId: CUID) => Promise<EmployeeSalaryConfigDto | null>;

  createPayslip: (data: {
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
