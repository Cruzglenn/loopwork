import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { type CUID } from '@/shared';
import { type AttendanceLogDto, type CompanyAttendanceOverviewDto } from '../../../model/dtos/attendance.dto';

export type AttendanceQueries = {
  getTodayStatus: (employeeId: CUID) => Promise<AttendanceLogDto | null>;
  getEmployeeDailyLog: (employeeId: CUID, date: Date) => Promise<AttendanceLogDto | null>;
  getEmployeeWeeklyLogs: (employeeId: CUID, startDate: Date, endDate: Date) => Promise<AttendanceLogDto[]>;
  getCompanyAttendanceOverview: (
    date: Date,
    search?: string,
    statusFilter?: string,
    page?: number,
    perPage?: number,
  ) => Promise<CompanyAttendanceOverviewDto>;
};

export function attendanceQueries(db: OrganizationPrismaClient): AttendanceQueries {
  const getTodayStatus = async (employeeId: CUID): Promise<AttendanceLogDto | null> => {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const log = await db.attendanceLog.findFirst({
      where: {
        employeeId,
        date: dateOnly,
      },
      include: {
        breaks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return (log as unknown as AttendanceLogDto) || null;
  };

  const getEmployeeDailyLog = async (employeeId: CUID, date: Date): Promise<AttendanceLogDto | null> => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const log = await db.attendanceLog.findFirst({
      where: {
        employeeId,
        date: dateOnly,
      },
      include: {
        breaks: true,
      },
    });

    return (log as unknown as AttendanceLogDto) || null;
  };

  const getEmployeeWeeklyLogs = async (
    employeeId: CUID,
    startDate: Date,
    endDate: Date,
  ): Promise<AttendanceLogDto[]> => {
    const logs = await db.attendanceLog.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        breaks: true,
      },
      orderBy: { date: 'asc' },
    });

    return logs as unknown as AttendanceLogDto[];
  };

  const getCompanyAttendanceOverview = async (
    date: Date,
    search?: string,
    statusFilter?: string,
  ): Promise<CompanyAttendanceOverviewDto> => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const employees = await db.employee.findMany({
      where: {
        status: 'ACTIVE',
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarId: true,
      },
    });

    const logs = await db.attendanceLog.findMany({
      where: {
        date: dateOnly,
      },
      include: {
        breaks: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            avatarId: true,
          },
        },
      },
    });

    const totalEmployees = employees.length;
    let clockedInCount = 0;
    let onBreakCount = 0;
    let clockedOutCount = 0;

    logs.forEach((log) => {
      if (log.status === 'CLOCKED_IN') clockedInCount++;
      else if (log.status === 'ON_BREAK') onBreakCount++;
      else if (log.status === 'CLOCKED_OUT') clockedOutCount++;
    });

    let filteredLogs = logs as unknown as AttendanceLogDto[];
    if (statusFilter && statusFilter !== 'ALL') {
      filteredLogs = filteredLogs.filter((l) => l.status === statusFilter);
    }

    return {
      date: dateOnly,
      totalEmployees,
      clockedInCount,
      onBreakCount,
      clockedOutCount,
      logs: filteredLogs,
    };
  };

  return {
    getTodayStatus,
    getEmployeeDailyLog,
    getEmployeeWeeklyLogs,
    getCompanyAttendanceOverview,
  };
}
