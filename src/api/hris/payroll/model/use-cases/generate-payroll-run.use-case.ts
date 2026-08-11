import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { ApiError } from '@/shared';
import { PAYROLL_ERRORS } from '../../errors';
import { type GeneratePayrollRunDto, type PayrollRunDto } from '../dtos';
import { type PayrollRepository } from '../repositories';

export function generatePayrollRunUseCase(
  payrollRepository: PayrollRepository,
  db: OrganizationPrismaClient,
) {
  return async (dto: GeneratePayrollRunDto): Promise<PayrollRunDto> => {
    const periodStart = new Date(dto.periodStart);
    const periodEnd = new Date(dto.periodEnd);

    if (periodEnd.getTime() < periodStart.getTime()) {
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

    const runName =
      dto.name ||
      `Payroll Run (${periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`;

    let overallGross = 0;
    let overallDeductions = 0;
    let overallNet = 0;

    // Temporary storage for generated payslips details
    const payslipPayloads: Array<{
      employeeId: string;
      basicPay: number;
      overtimePay: number;
      allowancesTotal: number;
      deductionsTotal: number;
      grossPay: number;
      netPay: number;
      items: Array<{ name: string; type: 'ALLOWANCE' | 'DEDUCTION'; amount: number }>;
    }> = [];

    for (const employee of employees) {
      const baseSalary = employee.salaryConfig?.baseSalary ?? 0;
      const hourlyRate = baseSalary > 0 ? employee.salaryConfig?.hourlyRate || baseSalary / 160 : 0;

      let basicPay = 0;
      let overtimePay = 0;
      let taxDeduction = 0;
      let healthDeduction = 0;
      let pensionDeduction = 0;
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
              gte: periodStart,
              lte: periodEnd,
            },
          },
        });

        const totalWorkMinutes = logs.reduce((sum, log) => sum + log.totalWorkMinutes, 0);
        const totalWorkHours = totalWorkMinutes / 60;

        // Check for Proration (Mid-period hire)
        const employeeCreatedAt = new Date(employee.createdAt);
        let prorationRatio = 1.0;
        let isProrated = false;

        if (employeeCreatedAt > periodStart && employeeCreatedAt <= periodEnd) {
          const totalPeriodDays = Math.max(
            1,
            Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)),
          );
          const activeDays = Math.max(
            1,
            Math.ceil((periodEnd.getTime() - employeeCreatedAt.getTime()) / (1000 * 60 * 60 * 24)),
          );
          prorationRatio = Math.min(1.0, activeDays / totalPeriodDays);
          isProrated = true;
        }

        // Standard period hours: 160 hrs. Overtime: > 160 hrs
        const standardHours = Math.min(160, totalWorkHours);
        const overtimeHours = Math.max(0, totalWorkHours - 160);

        const fullBasic = standardHours > 0 ? (standardHours / 160) * baseSalary : baseSalary;
        basicPay = Math.round(fullBasic * prorationRatio);
        overtimePay = Math.round(overtimeHours * hourlyRate * 1.5);
        grossPay = basicPay + overtimePay;

        // Progressive Tax Calculation Tiers
        // Tier 1: <= 10,000 -> 0%
        // Tier 2: 10,001 to 30,000 -> 10% on excess above 10,000
        // Tier 3: > 30,000 -> 2,000 + 20% on excess above 30,000
        if (grossPay <= 10000) {
          taxDeduction = 0;
        } else if (grossPay <= 30000) {
          taxDeduction = Math.round((grossPay - 10000) * 0.1);
        } else {
          taxDeduction = Math.round(2000 + (grossPay - 30000) * 0.2);
        }

        // Statutory Medical / Health (3%) & Pension / Social Protection (4%)
        healthDeduction = Math.round(grossPay * 0.03);
        pensionDeduction = Math.round(grossPay * 0.04);

        totalDeductions = taxDeduction + healthDeduction + pensionDeduction;
        netPay = Math.max(0, grossPay - totalDeductions);

        items = [
          {
            name: isProrated
              ? `Basic Salary (Prorated ${Math.round(prorationRatio * 100)}%)`
              : 'Basic Salary',
            type: 'ALLOWANCE',
            amount: basicPay,
          },
          ...(overtimePay > 0
            ? [
                {
                  name: `Overtime (${overtimeHours.toFixed(1)} hrs)`,
                  type: 'ALLOWANCE' as const,
                  amount: overtimePay,
                },
              ]
            : []),
          { name: 'Income Tax (Withholding)', type: 'DEDUCTION', amount: taxDeduction },
          { name: 'Health Insurance (Employee Share 3%)', type: 'DEDUCTION', amount: healthDeduction },
          {
            name: 'Social Security / Pension (Employee Share 4%)',
            type: 'DEDUCTION',
            amount: pensionDeduction,
          },
        ];
      }

      overallGross += grossPay;
      overallDeductions += totalDeductions;
      overallNet += netPay;

      payslipPayloads.push({
        employeeId: employee.id,
        basicPay,
        overtimePay,
        allowancesTotal: 0,
        deductionsTotal: totalDeductions,
        grossPay,
        netPay,
        items,
      });
    }

    // Create PayrollRun master record
    const payrollRun = await payrollRepository.createPayrollRun({
      name: runName,
      periodStart,
      periodEnd,
      notes: dto.notes,
      totalGross: overallGross,
      totalDeductions: overallDeductions,
      totalNet: overallNet,
      totalPayslips: payslipPayloads.length,
    });

    // Create individual Payslip items linked to payrollRun.id
    for (const payload of payslipPayloads) {
      await payrollRepository.createPayslip({
        payrollRunId: payrollRun.id,
        employeeId: payload.employeeId,
        periodStart,
        periodEnd,
        basicPay: payload.basicPay,
        overtimePay: payload.overtimePay,
        allowancesTotal: payload.allowancesTotal,
        deductionsTotal: payload.deductionsTotal,
        grossPay: payload.grossPay,
        netPay: payload.netPay,
        notes: dto.notes,
        items: payload.items,
      });
    }

    const createdRun = await payrollRepository.findPayrollRunById(payrollRun.id);
    if (!createdRun) {
      throw new ApiError(500, 'Failed to create payroll run');
    }

    return createdRun;
  };
}
