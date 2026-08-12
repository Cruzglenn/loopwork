import { type EmailSenderService } from '@/api/hris/acl/email-service.acl';
import { type CUID, parseDate } from '@/shared';
import { buildPayslipPdf } from '@/shared/service/file-persistance/payslip-pdf-builder';
import { logger } from '@/shared/service/pino';
import { type PayrollRepository } from '../repositories';
import { type PayrollRunDto } from '../dtos';

export function dispatchPayslipEmailsUseCase(
  payrollRepository: PayrollRepository,
  emailSenderService: EmailSenderService,
) {
  return async (
    run: PayrollRunDto,
    companyName: string = 'Loopwork Inc.',
    onlyFailedOrUnsent: boolean = true,
  ): Promise<void> => {
    let payslips = run.payslips || [];
    if (onlyFailedOrUnsent) {
      payslips = payslips.filter((slip) => slip.emailStatus !== 'SENT');
    }
    if (payslips.length === 0) return;

    logger.info(
      `Starting automated payslip email dispatch for payroll run: ${run.name} (${payslips.length} slips, onlyFailedOrUnsent=${onlyFailedOrUnsent})`,
    );

    for (const slip of payslips) {
      const workEmail = slip.employee?.workEmail;
      const employeeName = slip.employee
        ? `${slip.employee.firstName} ${slip.employee.lastName}`
        : 'Employee';

      if (!workEmail) {
        logger.warn(`Skipping payslip email for ${employeeName}: No work email address recorded.`);
        await payrollRepository.updatePayslipEmailStatus(
          slip.id,
          'FAILED',
          null,
          'No work email address recorded for employee',
        );
        continue;
      }

      try {
        await payrollRepository.updatePayslipEmailStatus(slip.id, 'PENDING');

        // 1. Generate PDF payslip in-memory
        const pdfBuffer = await buildPayslipPdf(slip, companyName);

        const periodLabel = `${parseDate(slip.periodStart, 'MMM DD')} - ${parseDate(slip.periodEnd, 'MMM DD, YYYY')}`;

        // 2. Send email with attached PDF
        await emailSenderService.sendEmail({
          to: workEmail,
          html: {
            template: 'payslipDisbursedTemplate',
            variables: {
              employeeName,
              payPeriod: periodLabel,
              grossPay: `₱${slip.grossPay.toLocaleString()}`,
              totalDeductions: `-₱${slip.deductionsTotal.toLocaleString()}`,
              netPay: `₱${slip.netPay.toLocaleString()}`,
            },
          },
          attachments: [
            {
              filename: `Payslip_${slip.employee?.lastName || 'Employee'}_${parseDate(slip.periodEnd, 'YYYY-MM-DD')}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ],
        });

        // 3. Mark as SENT on success
        await payrollRepository.updatePayslipEmailStatus(slip.id, 'SENT', new Date(), null);
        logger.info(`Successfully sent payslip email to ${workEmail} (${employeeName})`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error(`Failed to send payslip email to ${workEmail}`, { error: errorMsg, slipId: slip.id });
        await payrollRepository.updatePayslipEmailStatus(slip.id, 'FAILED', null, errorMsg);
      }
    }
  };
}

export function sendSinglePayslipEmailUseCase(
  payrollRepository: PayrollRepository,
  emailSenderService: EmailSenderService,
) {
  return async (payslipId: CUID, companyName: string = 'Loopwork Inc.'): Promise<void> => {
    const slip = await payrollRepository.findPayslipById(payslipId);
    if (!slip) {
      throw new Error('Payslip not found');
    }

    const workEmail = slip.employee?.workEmail;
    const employeeName = slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee';

    if (!workEmail) {
      await payrollRepository.updatePayslipEmailStatus(
        slip.id,
        'FAILED',
        null,
        'No work email address recorded for employee',
      );
      throw new Error(`Employee ${employeeName} has no work email address`);
    }

    try {
      await payrollRepository.updatePayslipEmailStatus(slip.id, 'PENDING');

      const pdfBuffer = await buildPayslipPdf(slip, companyName);
      const periodLabel = `${parseDate(slip.periodStart, 'MMM DD')} - ${parseDate(slip.periodEnd, 'MMM DD, YYYY')}`;

      await emailSenderService.sendEmail({
        to: workEmail,
        html: {
          template: 'payslipDisbursedTemplate',
          variables: {
            employeeName,
            payPeriod: periodLabel,
            grossPay: `₱${slip.grossPay.toLocaleString()}`,
            totalDeductions: `-₱${slip.deductionsTotal.toLocaleString()}`,
            netPay: `₱${slip.netPay.toLocaleString()}`,
          },
        },
        attachments: [
          {
            filename: `Payslip_${slip.employee?.lastName || 'Employee'}_${parseDate(slip.periodEnd, 'YYYY-MM-DD')}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      await payrollRepository.updatePayslipEmailStatus(slip.id, 'SENT', new Date(), null);
      logger.info(`Successfully sent individual payslip email to ${workEmail} (${employeeName})`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error(`Failed to send individual payslip email to ${workEmail}`, {
        error: errorMsg,
        slipId: slip.id,
      });
      await payrollRepository.updatePayslipEmailStatus(slip.id, 'FAILED', null, errorMsg);
      throw err;
    }
  };
}
