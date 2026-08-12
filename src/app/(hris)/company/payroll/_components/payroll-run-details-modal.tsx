'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { type PayrollRunDto } from '@/api/hris/payroll/model/dtos';
import { Button, Chip, Modal } from '@/lib/ui';
import { ModalHeader } from '@/lib/ui/components/modal/modal-header';
import { API_ROUTES, parseDate } from '@/shared';
import { resendPayrollRunEmailsAction } from '../_actions/manage-payroll-run.action';

type Props = {
  run: PayrollRunDto | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpenExport: (run: PayrollRunDto) => void;
};

export function PayrollRunDetailsModal({ run, isOpen, onOpenChange, onOpenExport }: Props) {
  const [isPending, startTransition] = useTransition();

  if (!run) return null;

  const handleResendEmails = () => {
    startTransition(async () => {
      await resendPayrollRunEmailsAction(run.id);
    });
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Chip intent="ok">APPROVED (LOCKED)</Chip>;
      case 'PAID':
        return <Chip intent="info">PAID</Chip>;
      case 'IN_REVIEW':
        return <Chip intent="warning">IN REVIEW</Chip>;
      case 'DRAFT':
      default:
        return <Chip intent="warning">DRAFT</Chip>;
    }
  };

  const getEmailStatusChip = (emailStatus?: string, error?: string | null) => {
    switch (emailStatus) {
      case 'SENT':
        return <Chip intent="ok">SENT</Chip>;
      case 'PENDING':
        return <Chip intent="warning">SENDING...</Chip>;
      case 'FAILED':
        return (
          <span title={error || 'Failed to send email'}>
            <Chip intent="critical">FAILED</Chip>
          </span>
        );
      case 'NOT_SENT':
      default:
        return <Chip intent="warning">NOT SENT</Chip>;
    }
  };

  return (
    <Modal className="md:max-w-3xl" isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title={run.name} onClose={() => onOpenChange(false)} />

      <div className="flex flex-col gap-6 py-2">
        {/* Header Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            {getStatusChip(run.status)}
            <span className="text-xs text-gray-500">
              Period: {parseDate(run.periodStart, 'MMM DD, YYYY')} -{' '}
              {parseDate(run.periodEnd, 'MMM DD, YYYY')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {run.status === 'PAID' && (
              <Button
                icon="refresh"
                intent="secondary"
                isDisabled={isPending}
                size="sm"
                onClick={handleResendEmails}
              >
                {isPending ? 'Sending...' : 'Resend Payslips'}
              </Button>
            )}
            <Button
              icon="arrow-down"
              intent="tertiary"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onOpenExport(run);
              }}
            >
              Export Reports
            </Button>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex flex-col rounded-lg border border-blue-100 bg-blue-50/60 p-3 text-center">
            <span className="text-xxs font-semibold uppercase text-gray-500">Gross Commitment</span>
            <span className="text-base font-bold text-blue-600">₱{run.totalGross.toLocaleString()}</span>
          </div>
          <div className="flex flex-col rounded-lg border border-red-100 bg-red-50/60 p-3 text-center">
            <span className="text-xxs font-semibold uppercase text-gray-500">Taxes & Deductions</span>
            <span className="text-base font-bold text-red-600">-₱{run.totalDeductions.toLocaleString()}</span>
          </div>
          <div className="bg-green-50/60 flex flex-col rounded-lg border border-green-100 p-3 text-center">
            <span className="text-xxs font-semibold uppercase text-gray-500">Net Payout</span>
            <span className="text-base font-bold text-green-600">₱{run.totalNet.toLocaleString()}</span>
          </div>
          <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
            <span className="text-xxs font-semibold uppercase text-gray-500">Total Employees</span>
            <span className="text-base font-bold text-gray-700">{run.totalPayslips}</span>
          </div>
        </div>

        {/* Included Payslips Table */}
        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-semibold text-gray-800">Included Employee Payslips</h4>
          <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                <tr>
                  <th className="p-2.5">Employee</th>
                  <th className="p-2.5 text-right">Gross</th>
                  <th className="p-2.5 text-right">Deductions</th>
                  <th className="p-2.5 text-right">Net Pay</th>
                  <th className="p-2.5 text-center">Email Status</th>
                  <th className="p-2.5 text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {(run.payslips || []).map((slip) => (
                  <tr key={slip.id} className="hover:bg-gray-50/80">
                    <td className="p-2.5 font-medium text-gray-900">
                      <div>
                        {slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee'}
                      </div>
                      {slip.employee?.workEmail && (
                        <div className="text-[10px] font-normal text-gray-400">{slip.employee.workEmail}</div>
                      )}
                    </td>
                    <td className="p-2.5 text-right">₱{slip.grossPay.toLocaleString()}</td>
                    <td className="p-2.5 text-right text-red-600">
                      -₱{slip.deductionsTotal.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-right font-bold text-green-600">
                      ₱{slip.netPay.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-center">
                      {getEmailStatusChip(slip.emailStatus, slip.emailError)}
                    </td>
                    <td className="p-2.5 text-right">
                      <Link href={API_ROUTES.downloadPayslip(slip.id)} target="_blank">
                        <Button icon="document-text" intent="ghost" size="sm" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
