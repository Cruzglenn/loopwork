import { ApiError, type CUID } from '@/shared';
import { type PayrollRepository } from '../repositories';
import { type PayrollRunDto } from '../dtos';

export function approvePayrollRunUseCase(payrollRepository: PayrollRepository) {
  return async (payrollRunId: CUID, reviewerId: CUID): Promise<PayrollRunDto> => {
    const run = await payrollRepository.findPayrollRunById(payrollRunId);
    if (!run) {
      throw new ApiError(404, 'Payroll run not found');
    }

    if (run.status === 'APPROVED' || run.status === 'PAID') {
      throw new ApiError(400, `Payroll run is already ${run.status.toLowerCase()}`);
    }

    return payrollRepository.updatePayrollRunStatus(payrollRunId, 'APPROVED', reviewerId);
  };
}
