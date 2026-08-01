'use server';

import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { requirePermission } from '@/api/hris/authorization';
import { ResourceType, PermissionAction } from '@/api/hris/authorization/permissions';
import { HRIS_ROUTES } from '@/shared';
import { handleActionError, type ActionReturnType } from '@/shared';

type ManualAttendanceForm = {
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut: string;
  breakMinutes?: number;
  notes?: string;
};

type ActionState = ActionReturnType<ManualAttendanceForm, undefined, undefined>;

export const logManualAttendanceAction = requirePermission(
  ResourceType.COMPANY_ATTENDANCE,
  PermissionAction.CREATE,
  async (_checker, prevState: ActionState, formData: FormData) => {
    try {
      const employeeId = formData.get('employeeId') as string;
      const dateStr = formData.get('date') as string;
      const clockInStr = formData.get('clockIn') as string;
      const clockOutStr = formData.get('clockOut') as string;
      const breakMinutes = Number(formData.get('breakMinutes') || 0);
      const notes = formData.get('notes') as string;

      const date = new Date(dateStr);
      const clockIn = new Date(`${dateStr}T${clockInStr}:00`);
      const clockOut = new Date(`${dateStr}T${clockOutStr}:00`);

      await hrisApi.attendance.logManualTime({
        employeeId,
        date,
        clockIn,
        clockOut,
        breakMinutes,
        notes,
      });

      revalidatePath(HRIS_ROUTES.company.attendance.base);

      return {
        ...prevState,
        status: 'success' as const,
      };
    } catch (err) {
      return {
        ...prevState,
        ...handleActionError(err),
      };
    }
  },
);
