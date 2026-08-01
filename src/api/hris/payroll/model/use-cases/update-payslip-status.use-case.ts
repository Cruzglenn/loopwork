import { type CUID } from '@/shared';
import { type PayrollStatusDto, type PayslipDto } from '../dtos';
import { type PayrollRepository } from '../repositories';

export function updatePayslipStatusUseCase(payrollRepository: PayrollRepository) {
  return async (payslipId: CUID, status: PayrollStatusDto): Promise<PayslipDto> => {
    const paidAt = status === 'PAID' ? new Date() : undefined;
    return payrollRepository.updatePayslipStatus(payslipId, status, paidAt);
  };
}
