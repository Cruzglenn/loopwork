import { ApiError, type CUID } from '@/shared';
import { type PayrollRepository } from '../repositories';
import { type PayrollRunDto } from '../dtos';

export function markPayrollRunPaidUseCase(payrollRepository: PayrollRepository) {
  return async (payrollRunId: CUID): Promise<PayrollRunDto> => {
    const run = await payrollRepository.findPayrollRunById(payrollRunId);
    if (!run) {
      throw new ApiError(404, 'Payroll run not found');
    }

    if (run.status === 'PAID') {
      throw new ApiError(400, 'Payroll run is already marked as paid');
    }

    if (run.status !== 'APPROVED') {
      throw new ApiError(400, 'Payroll run must be approved before marking as paid');
    }

    return payrollRepository.updatePayrollRunStatus(payrollRunId, 'PAID', undefined, new Date());
  };
}
