'use server';

import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { HRIS_ROUTES, handleActionError } from '@/shared';

export async function updateSalaryConfigAction(
  employeeId: string,
  baseSalary: number,
  payPeriod: 'WEEKLY' | 'BIWEEKLY' | 'SEMIMONTHLY' | 'MONTHLY' = 'MONTHLY',
  currency = 'USD',
) {
  try {
    await hrisApi.payroll.updateSalaryConfig({
      employeeId,
      baseSalary,
      payPeriod,
      currency,
    });
    revalidatePath(HRIS_ROUTES.employees.payroll.base(employeeId));
    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function updatePayslipStatusAction(payslipId: string, status: 'DRAFT' | 'APPROVED' | 'PAID') {
  try {
    const payslip = await hrisApi.payroll.updatePayslipStatus(payslipId, status);
    if (payslip.employeeId) {
      revalidatePath(HRIS_ROUTES.employees.payroll.base(payslip.employeeId));
    }
    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}
