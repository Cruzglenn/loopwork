import { ApiError } from '@/shared';
import { ATTENDANCE_ERRORS } from '../../errors';
import { type ClockOutDto, type AttendanceLogDto } from '../dtos';
import { type AttendanceRepository } from '../repositories';

export function clockOutUseCase(attendanceRepository: AttendanceRepository) {
  return async (dto: ClockOutDto): Promise<AttendanceLogDto> => {
    const log = dto.attendanceLogId
      ? await attendanceRepository.findLogById(dto.attendanceLogId)
      : await attendanceRepository.findActiveLogByEmployeeId(dto.employeeId);

    if (!log) {
      throw new ApiError(400, ATTENDANCE_ERRORS.NO_ACTIVE_CLOCKIN);
    }

    const clockOutTime = dto.clockOutTime || new Date();
    if (clockOutTime.getTime() < new Date(log.clockIn).getTime()) {
      throw new ApiError(400, ATTENDANCE_ERRORS.INVALID_TIME_RANGE);
    }

    // Close any active break if present
    if (log.status === 'ON_BREAK') {
      const activeBreak = await attendanceRepository.findActiveBreakByLogId(log.id);
      if (activeBreak) {
        const breakDuration = Math.round(
          (clockOutTime.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60),
        );
        await attendanceRepository.updateBreak(activeBreak.id, {
          endTime: clockOutTime,
          durationMinutes: breakDuration,
        });
        log.totalBreakMinutes += breakDuration;
      }
    }

    const totalElapsedMinutes = Math.round(
      (clockOutTime.getTime() - new Date(log.clockIn).getTime()) / (1000 * 60),
    );
    const totalWorkMinutes = Math.max(0, totalElapsedMinutes - log.totalBreakMinutes);

    return attendanceRepository.updateLog(log.id, {
      clockOut: clockOutTime,
      status: 'CLOCKED_OUT',
      totalWorkMinutes,
      totalBreakMinutes: log.totalBreakMinutes,
      notes: dto.notes ? (log.notes ? `${log.notes} | ${dto.notes}` : dto.notes) : log.notes || undefined,
    });
  };
}
