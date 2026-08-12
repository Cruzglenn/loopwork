import { ApiError, type CUID } from '@/shared';
import { type EmailSenderService } from '@/api/hris/acl/email-service.acl';
import { type PayrollRepository } from '../repositories';
import { type PayrollRunDto } from '../dtos';
import { dispatchPayslipEmailsUseCase } from './dispatch-payslip-emails.use-case';

export function markPayrollRunPaidUseCase(
  payrollRepository: PayrollRepository,
  emailSenderService?: EmailSenderService,
  companyName: string = 'Loopwork Inc.',
) {
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

    const updatedRun = await payrollRepository.updatePayrollRunStatus(
      payrollRunId,
      'PAID',
      undefined,
      new Date(),
    );

    // Trigger non-blocking automated email dispatch for all payslips in this run
    if (emailSenderService && run.payslips && run.payslips.length > 0) {
      dispatchPayslipEmailsUseCase(payrollRepository, emailSenderService)(run, companyName).catch(() => {
        // Log errors handled inside dispatcher
      });
    }

    return updatedRun;
  };
}
