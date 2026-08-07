import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { type CUID } from '@/shared';
import { type PayrollRepository } from '../../../model/repositories/payroll.repository.type';
import {
  type EmployeeSalaryConfigDto,
  type PayslipDto,
  type PayrollStatusDto,
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

  const createPayslip = async (data: {
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
    createPayslip,
    updatePayslipStatus,
    findPayslipById,
    findPayslipsByEmployeeId,
    deletePayslip,
  };
}
