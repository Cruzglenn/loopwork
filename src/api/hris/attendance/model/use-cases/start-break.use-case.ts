import { ApiError } from '@/shared';
import { ATTENDANCE_ERRORS } from '../../errors';
import { type StartBreakDto, type AttendanceBreakDto } from '../dtos';
import { type AttendanceRepository } from '../repositories';

export function startBreakUseCase(attendanceRepository: AttendanceRepository) {
  return async (dto: StartBreakDto): Promise<AttendanceBreakDto> => {
    const log = dto.attendanceLogId
      ? await attendanceRepository.findLogById(dto.attendanceLogId)
      : await attendanceRepository.findActiveLogByEmployeeId(dto.employeeId);

    if (!log) {
      throw new ApiError(400, ATTENDANCE_ERRORS.NO_ACTIVE_CLOCKIN);
    }

    if (log.status === 'ON_BREAK') {
      throw new ApiError(400, ATTENDANCE_ERRORS.ON_BREAK_ALREADY);
    }

    const now = dto.type ? new Date() : new Date();

    const breakRecord = await attendanceRepository.createBreak({
      attendanceLogId: log.id,
      startTime: now,
      type: dto.type || 'LUNCH',
      notes: dto.notes,
    });

    await attendanceRepository.updateLog(log.id, {
      status: 'ON_BREAK',
    });

    return breakRecord;
  };
}
