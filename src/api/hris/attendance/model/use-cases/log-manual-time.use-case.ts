import { ApiError } from '@/shared';
import { ATTENDANCE_ERRORS } from '../../errors';
import { type LogManualTimeDto, type AttendanceLogDto } from '../dtos';
import { type AttendanceRepository } from '../repositories';

export function logManualTimeUseCase(attendanceRepository: AttendanceRepository) {
  return async (dto: LogManualTimeDto): Promise<AttendanceLogDto> => {
    if (new Date(dto.clockOut).getTime() <= new Date(dto.clockIn).getTime()) {
      throw new ApiError(400, ATTENDANCE_ERRORS.INVALID_TIME_RANGE);
    }

    const totalElapsedMinutes = Math.round(
      (new Date(dto.clockOut).getTime() - new Date(dto.clockIn).getTime()) / (1000 * 60),
    );
    const breakMinutes = dto.breakMinutes || 0;
    const workMinutes = Math.max(0, totalElapsedMinutes - breakMinutes);

    const targetDate = new Date(dto.date);
    const dateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const log = await attendanceRepository.createLog({
      employeeId: dto.employeeId,
      date: dateOnly,
      clockIn: new Date(dto.clockIn),
      notes: dto.notes,
      isManual: true,
    });

    return attendanceRepository.updateLog(log.id, {
      clockOut: new Date(dto.clockOut),
      status: 'CLOCKED_OUT',
      totalWorkMinutes: workMinutes,
      totalBreakMinutes: breakMinutes,
    });
  };
}
