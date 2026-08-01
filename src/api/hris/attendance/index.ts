import { type OrganizationContext } from '@/api/hris';
import { attendanceController } from './infrastructure/controllers/attendance.controller';

export type AttendanceApi = ReturnType<typeof attendanceApi>;

export function attendanceApi(organizationContext: OrganizationContext) {
  return attendanceController(organizationContext);
}
