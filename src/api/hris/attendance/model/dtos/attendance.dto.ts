import { type CUID } from '@/shared';

export type AttendanceStatusDto = 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';
export type BreakTypeDto = 'LUNCH' | 'SHORT_BREAK' | 'PERSONAL' | 'OTHER';

export type AttendanceBreakDto = {
  id: CUID;
  attendanceLogId: CUID;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  type: BreakTypeDto;
  notes: string | null;
};

export type AttendanceLogDto = {
  id: CUID;
  employeeId: CUID;
  date: Date;
  clockIn: Date;
  clockOut: Date | null;
  status: AttendanceStatusDto;
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  notes: string | null;
  isManual: boolean;
  createdAt: Date;
  updatedAt: Date;
  breaks?: AttendanceBreakDto[];
  employee?: {
    id: CUID;
    firstName: string;
    lastName: string;
    role: string | null;
    avatarId: string | null;
  };
};

export type ClockInDto = {
  employeeId: CUID;
  clockInTime?: Date;
  notes?: string;
};

export type ClockOutDto = {
  employeeId: CUID;
  attendanceLogId?: CUID;
  clockOutTime?: Date;
  notes?: string;
};

export type StartBreakDto = {
  employeeId: CUID;
  attendanceLogId?: CUID;
  type?: BreakTypeDto;
  notes?: string;
};

export type EndBreakDto = {
  employeeId: CUID;
  attendanceLogId?: CUID;
};

export type LogManualTimeDto = {
  employeeId: CUID;
  date: Date;
  clockIn: Date;
  clockOut: Date;
  breakMinutes?: number;
  notes?: string;
};

export type CompanyAttendanceOverviewDto = {
  date: Date;
  totalEmployees: number;
  clockedInCount: number;
  onBreakCount: number;
  clockedOutCount: number;
  logs: AttendanceLogDto[];
};
