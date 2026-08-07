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
      const baseSalary = employee.salaryConfig?.baseSalary ?? 0;
      const hourlyRate = baseSalary > 0 ? employee.salaryConfig?.hourlyRate || baseSalary / 160 : 0;

      let basicPay = 0;
      let overtimePay = 0;
      let taxDeduction = 0;
      let healthDeduction = 0;
      let totalDeductions = 0;
      let grossPay = 0;
      let netPay = 0;
      let items: Array<{ name: string; type: 'ALLOWANCE' | 'DEDUCTION'; amount: number }> = [];

      if (baseSalary === 0) {
        items = [{ name: 'No Salary Configured', type: 'ALLOWANCE', amount: 0 }];
      } else {
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

        basicPay = Math.round(standardHours > 0 ? (standardHours / 160) * baseSalary : baseSalary);
        overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);
        grossPay = basicPay + overtimePay;

        // Standard statutory deductions: Income Tax (10%), Health & Insurance (5%)
        taxDeduction = Math.round(grossPay * 0.1);
        healthDeduction = Math.round(grossPay * 0.05);
        totalDeductions = taxDeduction + healthDeduction;
        netPay = Math.max(0, grossPay - totalDeductions);

        items = [
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
        ];
      }

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
        items,
      });

      generatedPayslips.push(payslip);
    }

    return generatedPayslips;
  };
}
