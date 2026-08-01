import { type OrganizationContext } from '@/api/hris';
import { requirePermission, privateRoute, type PermissionChecker } from '@/api/hris/authorization';
import { ResourceType, PermissionAction } from '@/api/hris/authorization/permissions';
import { type CUID } from '@/shared';
import { attendanceRepository } from '../database/repositories/attendance.repository';
import { attendanceQueries } from '../database/queries/attendance.queries';
import {
  type ClockInDto,
  type ClockOutDto,
  type StartBreakDto,
  type EndBreakDto,
  type LogManualTimeDto,
} from '../../model/dtos/attendance.dto';
import {
  clockInUseCase,
  clockOutUseCase,
  startBreakUseCase,
  endBreakUseCase,
  logManualTimeUseCase,
} from '../../model/use-cases';

export function attendanceController(organization: OrganizationContext) {
  const repository = attendanceRepository(organization.db);
  const queries = attendanceQueries(organization.db);

  const clockIn = async (_checker: PermissionChecker, dto: ClockInDto) => {
    return clockInUseCase(repository)(dto);
  };

  const clockOut = async (_checker: PermissionChecker, dto: ClockOutDto) => {
    return clockOutUseCase(repository)(dto);
  };

  const startBreak = async (_checker: PermissionChecker, dto: StartBreakDto) => {
    return startBreakUseCase(repository)(dto);
  };

  const endBreak = async (_checker: PermissionChecker, dto: EndBreakDto) => {
    return endBreakUseCase(repository)(dto);
  };

  const logManualTime = async (_checker: PermissionChecker, dto: LogManualTimeDto) => {
    return logManualTimeUseCase(repository)(dto);
  };

  const getTodayStatus = async (_checker: PermissionChecker, employeeId: CUID) => {
    return queries.getTodayStatus(employeeId);
  };

  const getEmployeeDailyLog = async (_checker: PermissionChecker, employeeId: CUID, date: Date) => {
    return queries.getEmployeeDailyLog(employeeId, date);
  };

  const getEmployeeWeeklyLogs = async (
    _checker: PermissionChecker,
    employeeId: CUID,
    startDate: Date,
    endDate: Date,
  ) => {
    return queries.getEmployeeWeeklyLogs(employeeId, startDate, endDate);
  };

  const getCompanyOverview = async (
    _checker: PermissionChecker,
    date: Date,
    search?: string,
    statusFilter?: string,
  ) => {
    return queries.getCompanyAttendanceOverview(date, search, statusFilter);
  };

  return {
    clockIn: privateRoute(clockIn),
    clockOut: privateRoute(clockOut),
    startBreak: privateRoute(startBreak),
    endBreak: privateRoute(endBreak),
    logManualTime: privateRoute(logManualTime),
    getTodayStatus: privateRoute(getTodayStatus),
    getEmployeeDailyLog: privateRoute(getEmployeeDailyLog),
    getEmployeeWeeklyLogs: privateRoute(getEmployeeWeeklyLogs),
    getCompanyOverview: requirePermission(
      ResourceType.COMPANY_ATTENDANCE,
      PermissionAction.VIEW,
      getCompanyOverview,
    ),
  };
}
