'use server';

import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { HRIS_ROUTES, handleActionError, type CUID } from '@/shared';

export async function approvePayrollRunAction(runId: CUID) {
  try {
    await hrisApi.payroll.approvePayrollRun(runId);
    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function markPayrollRunPaidAction(runId: CUID) {
  try {
    await hrisApi.payroll.markPayrollRunPaid(runId);
    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function resendPayrollRunEmailsAction(runId: CUID, onlyFailedOrUnsent: boolean = true) {
  try {
    await hrisApi.payroll.resendPayrollRunEmails(runId, onlyFailedOrUnsent);
    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function sendSinglePayslipEmailAction(payslipId: CUID) {
  try {
    await hrisApi.payroll.sendSinglePayslipEmail(payslipId);
    revalidatePath(HRIS_ROUTES.company.payroll.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}
