import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { type CUID } from '@/shared';
import { type AttendanceRepository } from '../../../model/repositories/attendance.repository.type';
import {
  type AttendanceBreakDto,
  type AttendanceLogDto,
  type BreakTypeDto,
} from '../../../model/dtos/attendance.dto';

export function attendanceRepository(db: OrganizationPrismaClient): AttendanceRepository {
  const createLog = async (data: {
    employeeId: CUID;
    date: Date;
    clockIn: Date;
    notes?: string;
    isManual?: boolean;
  }): Promise<AttendanceLogDto> => {
    const log = await db.attendanceLog.create({
      data: {
        employeeId: data.employeeId,
        date: data.date,
        clockIn: data.clockIn,
        notes: data.notes || null,
        isManual: data.isManual || false,
        status: 'CLOCKED_IN',
      },
      include: {
        breaks: true,
      },
    });
    return log as unknown as AttendanceLogDto;
  };

  const updateLog = async (
    id: CUID,
    data: {
      clockOut?: Date;
      status?: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';
      totalWorkMinutes?: number;
      totalBreakMinutes?: number;
      notes?: string;
    },
  ): Promise<AttendanceLogDto> => {
    const updated = await db.attendanceLog.update({
      where: { id },
      data: {
        ...(data.clockOut !== undefined && { clockOut: data.clockOut }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.totalWorkMinutes !== undefined && { totalWorkMinutes: data.totalWorkMinutes }),
        ...(data.totalBreakMinutes !== undefined && { totalBreakMinutes: data.totalBreakMinutes }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        breaks: true,
      },
    });
    return updated as unknown as AttendanceLogDto;
  };

  const findActiveLogByEmployeeId = async (employeeId: CUID): Promise<AttendanceLogDto | null> => {
    const log = await db.attendanceLog.findFirst({
      where: {
        employeeId,
        status: { in: ['CLOCKED_IN', 'ON_BREAK'] },
      },
      include: {
        breaks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return (log as unknown as AttendanceLogDto) || null;
  };

  const findLogById = async (id: CUID): Promise<AttendanceLogDto | null> => {
    const log = await db.attendanceLog.findUnique({
      where: { id },
      include: {
        breaks: true,
      },
    });
    return (log as unknown as AttendanceLogDto) || null;
  };

  const findLogsByEmployeeId = async (
    employeeId: CUID,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AttendanceLogDto[]> => {
    const logs = await db.attendanceLog.findMany({
      where: {
        employeeId,
        ...(startDate && endDate && { date: { gte: startDate, lte: endDate } }),
      },
      include: {
        breaks: true,
      },
      orderBy: { date: 'desc' },
    });
    return logs as unknown as AttendanceLogDto[];
  };

  const createBreak = async (data: {
    attendanceLogId: CUID;
    startTime: Date;
    type?: BreakTypeDto;
    notes?: string;
  }): Promise<AttendanceBreakDto> => {
    const breakRecord = await db.attendanceBreak.create({
      data: {
        attendanceLogId: data.attendanceLogId,
        startTime: data.startTime,
        type: data.type || 'LUNCH',
        notes: data.notes || null,
      },
    });
    return breakRecord as unknown as AttendanceBreakDto;
  };

  const updateBreak = async (
    id: CUID,
    data: {
      endTime: Date;
      durationMinutes: number;
    },
  ): Promise<AttendanceBreakDto> => {
    const updated = await db.attendanceBreak.update({
      where: { id },
      data: {
        endTime: data.endTime,
        durationMinutes: data.durationMinutes,
      },
    });
    return updated as unknown as AttendanceBreakDto;
  };

  const findActiveBreakByLogId = async (attendanceLogId: CUID): Promise<AttendanceBreakDto | null> => {
    const breakRecord = await db.attendanceBreak.findFirst({
      where: {
        attendanceLogId,
        endTime: null,
      },
      orderBy: { createdAt: 'desc' },
    });
    return (breakRecord as unknown as AttendanceBreakDto) || null;
  };

  const deleteLog = async (id: CUID): Promise<void> => {
    await db.attendanceLog.delete({
      where: { id },
    });
  };

  return {
    createLog,
    updateLog,
    findActiveLogByEmployeeId,
    findLogById,
    findLogsByEmployeeId,
    createBreak,
    updateBreak,
    findActiveBreakByLogId,
    deleteLog,
  };
}
