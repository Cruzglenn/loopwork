import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { type CUID } from '@/shared';
import { type PayrollRepository } from '../../../model/repositories/payroll.repository.type';
import {
  type EmployeeSalaryConfigDto,
  type PayslipDto,
  type PayrollRunDto,
  type PayrollStatusDto,
  type PayrollRunStatusDto,
  type UpdateSalaryConfigDto,
} from '../../../model/dtos/payroll.dto';

export function payrollRepository(db: OrganizationPrismaClient): PayrollRepository {
  const upsertSalaryConfig = async (dto: UpdateSalaryConfigDto): Promise<EmployeeSalaryConfigDto> => {
    const config = await db.employeeSalaryConfig.upsert({
      where: { employeeId: dto.employeeId },
      update: {
        baseSalary: dto.baseSalary,
        ...(dto.payPeriod && { payPeriod: dto.payPeriod }),
        ...(dto.hourlyRate !== undefined && { hourlyRate: dto.hourlyRate }),
        ...(dto.currency && { currency: dto.currency }),
      },
      create: {
        employeeId: dto.employeeId,
        baseSalary: dto.baseSalary,
        payPeriod: dto.payPeriod || 'MONTHLY',
        hourlyRate: dto.hourlyRate || dto.baseSalary / 160,
        currency: dto.currency || 'PHP',
      },
    });
    return config as unknown as EmployeeSalaryConfigDto;
  };

  const findSalaryConfigByEmployeeId = async (employeeId: CUID): Promise<EmployeeSalaryConfigDto | null> => {
    const config = await db.employeeSalaryConfig.findUnique({
      where: { employeeId },
    });
    return (config as unknown as EmployeeSalaryConfigDto) || null;
  };

  const createPayrollRun = async (data: {
    name: string;
    periodStart: Date;
    periodEnd: Date;
    notes?: string;
    totalGross: number;
    totalDeductions: number;
    totalNet: number;
    totalPayslips: number;
  }): Promise<PayrollRunDto> => {
    const run = await db.payrollRun.create({
      data: {
        name: data.name,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        notes: data.notes || null,
        totalGross: data.totalGross,
        totalDeductions: data.totalDeductions,
        totalNet: data.totalNet,
        totalPayslips: data.totalPayslips,
        status: 'DRAFT',
      },
    });
    return run as unknown as PayrollRunDto;
  };

  const updatePayrollRunStatus = async (
    id: CUID,
    status: PayrollRunStatusDto,
    approvedById?: string,
    paidAt?: Date,
  ): Promise<PayrollRunDto> => {
    const updatedRun = await db.payrollRun.update({
      where: { id },
      data: {
        status,
        ...(approvedById && { approvedById }),
        ...(paidAt !== undefined && { paidAt }),
      },
    });

    // Cascade status to child payslips
    if (status === 'APPROVED') {
      await db.payslip.updateMany({
        where: { payrollRunId: id },
        data: { status: 'APPROVED' },
      });
    } else if (status === 'PAID') {
      await db.payslip.updateMany({
        where: { payrollRunId: id },
        data: { status: 'PAID', paidAt: paidAt || new Date() },
      });
    }

    return updatedRun as unknown as PayrollRunDto;
  };

  const findPayrollRunById = async (id: CUID): Promise<PayrollRunDto | null> => {
    const run = await db.payrollRun.findUnique({
      where: { id },
      include: {
        payslips: {
          include: {
            items: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                workEmail: true,
                role: true,
                avatarId: true,
              },
            },
          },
        },
      },
    });
    return (run as unknown as PayrollRunDto) || null;
  };

  const getAllPayrollRuns = async (): Promise<PayrollRunDto[]> => {
    const runs = await db.payrollRun.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        payslips: {
          include: {
            items: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                workEmail: true,
                role: true,
                avatarId: true,
              },
            },
          },
        },
      },
    });
    return runs as unknown as PayrollRunDto[];
  };

  const createPayslip = async (data: {
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
  }): Promise<PayslipDto> => {
    const payslip = await db.payslip.create({
      data: {
        payrollRunId: data.payrollRunId || null,
        employeeId: data.employeeId,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        basicPay: data.basicPay,
        overtimePay: data.overtimePay,
        allowancesTotal: data.allowancesTotal,
        deductionsTotal: data.deductionsTotal,
        grossPay: data.grossPay,
        netPay: data.netPay,
        notes: data.notes || null,
        status: 'DRAFT',
        items: {
          create: data.items.map((item) => ({
            name: item.name,
            type: item.type,
            amount: item.amount,
          })),
        },
      },
      include: {
        items: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            workEmail: true,
            role: true,
            avatarId: true,
          },
        },
      },
    });
    return payslip as unknown as PayslipDto;
  };

  const updatePayslipStatus = async (
    id: CUID,
    status: PayrollStatusDto,
    paidAt?: Date,
  ): Promise<PayslipDto> => {
    const updated = await db.payslip.update({
      where: { id },
      data: {
        status,
        ...(paidAt !== undefined && { paidAt }),
      },
      include: {
        items: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            workEmail: true,
            role: true,
            avatarId: true,
          },
        },
      },
    });
    return updated as unknown as PayslipDto;
  };

  const updatePayslipEmailStatus = async (
    id: CUID,
    emailStatus: 'NOT_SENT' | 'PENDING' | 'SENT' | 'FAILED',
    emailedAt?: Date | null,
    emailError?: string | null,
  ): Promise<PayslipDto> => {
    const updated = await db.payslip.update({
      where: { id },
      data: {
        emailStatus,
        ...(emailedAt !== undefined && { emailedAt }),
        ...(emailError !== undefined && { emailError }),
      },
      include: {
        items: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            workEmail: true,
            role: true,
            avatarId: true,
          },
        },
      },
    });
    return updated as unknown as PayslipDto;
  };

  const findPayslipById = async (id: CUID): Promise<PayslipDto | null> => {
    const payslip = await db.payslip.findUnique({
      where: { id },
      include: {
        items: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            workEmail: true,
            role: true,
            avatarId: true,
          },
        },
      },
    });
    return (payslip as unknown as PayslipDto) || null;
  };

  const findPayslipsByEmployeeId = async (employeeId: CUID): Promise<PayslipDto[]> => {
    const payslips = await db.payslip.findMany({
      where: { employeeId },
      include: {
        items: true,
      },
      orderBy: { periodEnd: 'desc' },
    });
    return payslips as unknown as PayslipDto[];
  };

  const deletePayslip = async (id: CUID): Promise<void> => {
    await db.payslip.delete({
      where: { id },
    });
  };

  return {
    upsertSalaryConfig,
    findSalaryConfigByEmployeeId,
    createPayrollRun,
    updatePayrollRunStatus,
    findPayrollRunById,
    getAllPayrollRuns,
    createPayslip,
    updatePayslipStatus,
    updatePayslipEmailStatus,
    findPayslipById,
    findPayslipsByEmployeeId,
    deletePayslip,
  };
}
