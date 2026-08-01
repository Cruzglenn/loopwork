import { ApiError } from '@/shared';
import { ATTENDANCE_ERRORS } from '../../errors';
import { type ClockInDto, type AttendanceLogDto } from '../dtos';
import { type AttendanceRepository } from '../repositories';

export function clockInUseCase(attendanceRepository: AttendanceRepository) {
  return async (dto: ClockInDto): Promise<AttendanceLogDto> => {
    const activeLog = await attendanceRepository.findActiveLogByEmployeeId(dto.employeeId);
    if (activeLog) {
      throw new ApiError(400, ATTENDANCE_ERRORS.ACTIVE_CLOCKIN_EXISTS);
    }

    const now = dto.clockInTime || new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return attendanceRepository.createLog({
      employeeId: dto.employeeId,
      date: today,
      clockIn: now,
      notes: dto.notes,
      isManual: false,
    });
  };
}
