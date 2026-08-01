'use server';

import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { HRIS_ROUTES, handleActionError } from '@/shared';

export async function clockInAction(employeeId: string, notes?: string) {
  try {
    await hrisApi.attendance.clockIn({ employeeId, notes });
    revalidatePath(HRIS_ROUTES.employees.attendance.base(employeeId));
    revalidatePath(HRIS_ROUTES.company.attendance.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function clockOutAction(employeeId: string, notes?: string) {
  try {
    await hrisApi.attendance.clockOut({ employeeId, notes });
    revalidatePath(HRIS_ROUTES.employees.attendance.base(employeeId));
    revalidatePath(HRIS_ROUTES.company.attendance.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function startBreakAction(
  employeeId: string,
  type?: 'LUNCH' | 'SHORT_BREAK' | 'PERSONAL' | 'OTHER',
) {
  try {
    await hrisApi.attendance.startBreak({ employeeId, type });
    revalidatePath(HRIS_ROUTES.employees.attendance.base(employeeId));
    revalidatePath(HRIS_ROUTES.company.attendance.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}

export async function endBreakAction(employeeId: string) {
  try {
    await hrisApi.attendance.endBreak({ employeeId });
    revalidatePath(HRIS_ROUTES.employees.attendance.base(employeeId));
    revalidatePath(HRIS_ROUTES.company.attendance.base);
    return { success: true };
  } catch (err) {
    return handleActionError(err);
  }
}
