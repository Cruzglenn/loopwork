import { type CUID } from '@/shared';
import { type AttendanceBreakDto, type AttendanceLogDto, type BreakTypeDto } from '../dtos/attendance.dto';

export type AttendanceRepository = {
  createLog: (data: {
    employeeId: CUID;
    date: Date;
    clockIn: Date;
    notes?: string;
    isManual?: boolean;
  }) => Promise<AttendanceLogDto>;

  updateLog: (
    id: CUID,
    data: {
      clockOut?: Date;
      status?: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';
      totalWorkMinutes?: number;
      totalBreakMinutes?: number;
      notes?: string;
    },
  ) => Promise<AttendanceLogDto>;

  findActiveLogByEmployeeId: (employeeId: CUID) => Promise<AttendanceLogDto | null>;
  findLogById: (id: CUID) => Promise<AttendanceLogDto | null>;
  findLogsByEmployeeId: (employeeId: CUID, startDate?: Date, endDate?: Date) => Promise<AttendanceLogDto[]>;

  createBreak: (data: {
    attendanceLogId: CUID;
    startTime: Date;
    type?: BreakTypeDto;
    notes?: string;
  }) => Promise<AttendanceBreakDto>;

  updateBreak: (
    id: CUID,
    data: {
      endTime: Date;
      durationMinutes: number;
    },
  ) => Promise<AttendanceBreakDto>;

  findActiveBreakByLogId: (attendanceLogId: CUID) => Promise<AttendanceBreakDto | null>;
  deleteLog: (id: CUID) => Promise<void>;
};
