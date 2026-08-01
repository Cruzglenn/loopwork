import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { ApiError } from '@/shared';
import { PAYROLL_ERRORS } from '../../errors';
import { type GeneratePayrollRunDto, type PayslipDto } from '../dtos';
import { type PayrollRepository } from '../repositories';

export function generatePayrollRunUseCase(
  payrollRepository: PayrollRepository,
  db: OrganizationPrismaClient,
) {
  return async (dto: GeneratePayrollRunDto): Promise<PayslipDto[]> => {
    if (new Date(dto.periodEnd).getTime() < new Date(dto.periodStart).getTime()) {
      throw new ApiError(400, PAYROLL_ERRORS.INVALID_PAY_PERIOD);
    }

    const employees = await db.employee.findMany({
      where: {
        status: 'ACTIVE',
        ...(dto.employeeIds && dto.employeeIds.length > 0 && { id: { in: dto.employeeIds } }),
      },
      include: {
        salaryConfig: true,
      },
    });

    const generatedPayslips: PayslipDto[] = [];

    for (const employee of employees) {
      const baseSalary = employee.salaryConfig?.baseSalary || 3000;
      const hourlyRate = employee.salaryConfig?.hourlyRate || baseSalary / 160;

      // Query attendance logs for total worked minutes in period
      const logs = await db.attendanceLog.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: dto.periodStart,
            lte: dto.periodEnd,
          },
        },
      });

      const totalWorkMinutes = logs.reduce((sum, log) => sum + log.totalWorkMinutes, 0);
      const totalWorkHours = totalWorkMinutes / 60;

      // Standard period hours: 160 hrs. Overtime: > 160 hrs
      const standardHours = Math.min(160, totalWorkHours);
      const overtimeHours = Math.max(0, totalWorkHours - 160);

      const basicPay = Math.round(standardHours > 0 ? (standardHours / 160) * baseSalary : baseSalary);
      const overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);

      const grossPay = basicPay + overtimePay;

      // Standard statutory deductions: Income Tax (10%), Health & Insurance (5%)
      const taxDeduction = Math.round(grossPay * 0.1);
      const healthDeduction = Math.round(grossPay * 0.05);
      const totalDeductions = taxDeduction + healthDeduction;

      const netPay = Math.max(0, grossPay - totalDeductions);

      const payslip = await payrollRepository.createPayslip({
        employeeId: employee.id,
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        basicPay,
        overtimePay,
        allowancesTotal: 0,
        deductionsTotal: totalDeductions,
        grossPay,
        netPay,
        notes: dto.notes,
        items: [
          { name: 'Basic Salary', type: 'ALLOWANCE', amount: basicPay },
          ...(overtimePay > 0
            ? [
                {
                  name: `Overtime (${overtimeHours.toFixed(1)} hrs)`,
                  type: 'ALLOWANCE' as const,
                  amount: overtimePay,
                },
              ]
            : []),
          { name: 'Income Tax (10%)', type: 'DEDUCTION', amount: taxDeduction },
          { name: 'Health & Insurance (5%)', type: 'DEDUCTION', amount: healthDeduction },
        ],
      });

      generatedPayslips.push(payslip);
    }

    return generatedPayslips;
  };
}
