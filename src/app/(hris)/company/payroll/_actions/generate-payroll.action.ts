'use server';

import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { HRIS_ROUTES, handleActionError } from '@/shared';

export async function generatePayrollRunAction(formData: FormData) {
  try {
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const notes = formData.get('notes') as string;

    const periodStart = new Date(startDateStr);
    const periodEnd = new Date(endDateStr);

    await hrisApi.payroll.generatePayrollRun({
      periodStart,
      periodEnd,
      notes,
    });

    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}
