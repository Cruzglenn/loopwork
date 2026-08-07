import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { type CUID } from '@/shared';
import {
  type CompanyPayrollOverviewDto,
  type EmployeeSalaryConfigDto,
  type PayslipDto,
  type PayrollStatusDto,
} from '../../../model/dtos/payroll.dto';

export type PayrollQueries = {
  getSalaryConfig: (employeeId: CUID) => Promise<EmployeeSalaryConfigDto | null>;
  getPayslipById: (id: CUID) => Promise<PayslipDto | null>;
  getEmployeePayslips: (employeeId: CUID) => Promise<PayslipDto[]>;
  getCompanyPayrollOverview: (
    startDate?: Date,
    endDate?: Date,
    statusFilter?: string,
    search?: string,
    page?: number,
    perPage?: number,
  ) => Promise<CompanyPayrollOverviewDto>;
};

export function payrollQueries(db: OrganizationPrismaClient): PayrollQueries {
  const getSalaryConfig = async (employeeId: CUID): Promise<EmployeeSalaryConfigDto | null> => {
    const config = await db.employeeSalaryConfig.findUnique({
      where: { employeeId },
    });
    return (config as unknown as EmployeeSalaryConfigDto) || null;
  };

  const getPayslipById = async (id: CUID): Promise<PayslipDto | null> => {
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

  const getEmployeePayslips = async (employeeId: CUID): Promise<PayslipDto[]> => {
    const payslips = await db.payslip.findMany({
      where: { employeeId },
      include: {
        items: true,
      },
      orderBy: { periodEnd: 'desc' },
    });
    return payslips as unknown as PayslipDto[];
  };

  const getCompanyPayrollOverview = async (
    startDate?: Date,
    endDate?: Date,
    statusFilter?: string,
    search?: string,
    page: number = 1,
    perPage: number = 10,
  ): Promise<CompanyPayrollOverviewDto> => {
    const now = new Date();
    const periodStart = startDate || new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const allPayslips = await db.payslip.findMany({
      where: {
        ...(statusFilter && statusFilter !== 'ALL' && { status: statusFilter as PayrollStatusDto }),
        ...(search && {
          employee: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        }),
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
      orderBy: { createdAt: 'desc' },
    });

    const totalPayslips = allPayslips.length;
    let totalGrossPay = 0;
    let totalNetPay = 0;
    let totalDeductions = 0;

    allPayslips.forEach((slip) => {
      totalGrossPay += slip.grossPay;
      totalNetPay += slip.netPay;
      totalDeductions += slip.deductionsTotal;
    });

    const totalPages = Math.ceil(totalPayslips / perPage) || 1;
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * perPage;
    const paginatedPayslips = allPayslips.slice(startIndex, startIndex + perPage);

    return {
      periodStart,
      periodEnd,
      totalPayslips,
      totalGrossPay: Math.round(totalGrossPay),
      totalNetPay: Math.round(totalNetPay),
      totalDeductions: Math.round(totalDeductions),
      payslips: paginatedPayslips as unknown as PayslipDto[],
      page: validPage,
      perPage,
      totalPages,
      nextPage: validPage < totalPages ? validPage + 1 : null,
      prevPage: validPage > 1 ? validPage - 1 : null,
    };
  };

  return {
    getSalaryConfig,
    getPayslipById,
    getEmployeePayslips,
    getCompanyPayrollOverview,
  };
}
