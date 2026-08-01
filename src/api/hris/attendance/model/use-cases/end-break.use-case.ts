import { ApiError } from '@/shared';
import { ATTENDANCE_ERRORS } from '../../errors';
import { type EndBreakDto, type AttendanceLogDto } from '../dtos';
import { type AttendanceRepository } from '../repositories';

export function endBreakUseCase(attendanceRepository: AttendanceRepository) {
  return async (dto: EndBreakDto): Promise<AttendanceLogDto> => {
    const log = dto.attendanceLogId
      ? await attendanceRepository.findLogById(dto.attendanceLogId)
      : await attendanceRepository.findActiveLogByEmployeeId(dto.employeeId);

    if (!log) {
      throw new ApiError(400, ATTENDANCE_ERRORS.NO_ACTIVE_CLOCKIN);
    }

    const activeBreak = await attendanceRepository.findActiveBreakByLogId(log.id);
    if (!activeBreak) {
      throw new ApiError(400, ATTENDANCE_ERRORS.NO_ACTIVE_BREAK);
    }

    const now = new Date();
    const durationMinutes = Math.round(
      (now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60),
    );

    await attendanceRepository.updateBreak(activeBreak.id, {
      endTime: now,
      durationMinutes,
    });

    const newTotalBreakMinutes = log.totalBreakMinutes + durationMinutes;

    return attendanceRepository.updateLog(log.id, {
      status: 'CLOCKED_IN',
      totalBreakMinutes: newTotalBreakMinutes,
    });
  };
}
