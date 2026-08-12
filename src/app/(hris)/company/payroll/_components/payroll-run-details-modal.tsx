'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { type PayrollRunDto, type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { Button, Chip, Modal } from '@/lib/ui';
import { ModalHeader } from '@/lib/ui/components/modal/modal-header';
import { useToast } from '@/lib/ui/hooks';
import { API_ROUTES, parseDate } from '@/shared';
import {
  resendPayrollRunEmailsAction,
  sendSinglePayslipEmailAction,
} from '../_actions/manage-payroll-run.action';

type Props = {
  run: PayrollRunDto | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onOpenExport: (run: PayrollRunDto) => void;
};

export function PayrollRunDetailsModal({ run, isOpen, onOpenChange, onOpenExport }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [sendingSlipId, setSendingSlipId] = useState<string | null>(null);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; currentName: string } | null>(
    null,
  );
  const [payslips, setPayslips] = useState<PayslipDto[]>(run?.payslips || []);

  useEffect(() => {
    if (run?.payslips) {
      setPayslips(run.payslips);
    }
  }, [run?.payslips]);

  if (!run) return null;

  const unsentCount = payslips.filter((s) => s.emailStatus !== 'SENT').length;
  const totalCount = payslips.length;

  const handleBatchResend = (forceAll: boolean = false) => {
    const targets = forceAll ? payslips : payslips.filter((s) => s.emailStatus !== 'SENT');

    if (targets.length === 0) {
      toast({
        intent: 'success',
        label: 'All payslips in this run have already been emailed successfully!',
      });
      return;
    }

    setIsBatchSending(true);
    let successCount = 0;
    let failedCount = 0;

    startTransition(async () => {
      try {
        for (let i = 0; i < targets.length; i++) {
          const slip = targets[i]!;
          const empName = slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee';

          setProgress({ current: i + 1, total: targets.length, currentName: empName });

          setPayslips((prev) =>
            prev.map((s) => (s.id === slip.id ? { ...s, emailStatus: 'PENDING', emailError: null } : s)),
          );

          try {
            const res = await sendSinglePayslipEmailAction(slip.id);
            if (res && 'error' in res) {
              failedCount++;
              const errorMsg = typeof res.error === 'string' ? res.error : 'Failed to send email';
              setPayslips((prev) =>
                prev.map((s) =>
                  s.id === slip.id ? { ...s, emailStatus: 'FAILED', emailError: errorMsg } : s,
                ),
              );
            } else {
              successCount++;
              setPayslips((prev) =>
                prev.map((s) =>
                  s.id === slip.id
                    ? { ...s, emailStatus: 'SENT', emailedAt: new Date(), emailError: null }
                    : s,
                ),
              );
            }
          } catch (err) {
            failedCount++;
            const errorMsg = err instanceof Error ? err.message : String(err);
            setPayslips((prev) =>
              prev.map((s) => (s.id === slip.id ? { ...s, emailStatus: 'FAILED', emailError: errorMsg } : s)),
            );
          }
        }

        toast({
          intent: failedCount > 0 ? 'error' : 'success',
          label: `Batch email dispatch complete: ${successCount} SENT, ${failedCount} FAILED`,
        });
      } finally {
        setIsBatchSending(false);
        setProgress(null);
        router.refresh();
      }
    });
  };

  const handleSendSingleEmail = (slipId: string, employeeName: string) => {
    setSendingSlipId(slipId);
    setPayslips((prev) =>
      prev.map((s) => (s.id === slipId ? { ...s, emailStatus: 'PENDING', emailError: null } : s)),
    );

    startTransition(async () => {
      try {
        const res = await sendSinglePayslipEmailAction(slipId);
        if (res && 'error' in res) {
          const errorMsg = typeof res.error === 'string' ? res.error : 'Failed to send email';
          setPayslips((prev) =>
            prev.map((s) => (s.id === slipId ? { ...s, emailStatus: 'FAILED', emailError: errorMsg } : s)),
          );
          toast({ intent: 'error', label: `Failed to send email to ${employeeName}` });
        } else {
          setPayslips((prev) =>
            prev.map((s) =>
              s.id === slipId ? { ...s, emailStatus: 'SENT', emailedAt: new Date(), emailError: null } : s,
            ),
          );
          toast({ intent: 'success', label: `Payslip email sent to ${employeeName}!` });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        setPayslips((prev) =>
          prev.map((s) => (s.id === slipId ? { ...s, emailStatus: 'FAILED', emailError: errorMsg } : s)),
        );
        toast({ intent: 'error', label: `Failed to send email to ${employeeName}` });
      } finally {
        setSendingSlipId(null);
        router.refresh();
      }
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
          <span title={error || 'Failed to send email. Hover to see error.'}>
            <Chip intent="critical">FAILED</Chip>
          </span>
        );
      case 'NOT_SENT':
      default:
        return <Chip intent="warning">NOT SENT</Chip>;
    }
  };

  return (
    <Modal className="md:max-w-4xl" isOpen={isOpen} onOpenChange={onOpenChange}>
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

          <div className="flex flex-wrap items-center gap-2">
            {run.status === 'PAID' && (
              <>
                {/* Primary Smart Action: Send Remaining / Unsent Only */}
                <Button
                  icon="refresh"
                  intent="secondary"
                  isDisabled={isPending || isBatchSending}
                  isLoading={isBatchSending}
                  size="sm"
                  onClick={() => handleBatchResend(false)}
                >
                  {isBatchSending
                    ? 'Sending Batch...'
                    : unsentCount > 0
                      ? `Send Remaining Emails (${unsentCount})`
                      : `Resend All Emails (${totalCount})`}
                </Button>

                {/* Secondary Action: Force Resend All */}
                {unsentCount > 0 && unsentCount < totalCount && (
                  <Button
                    icon="refresh"
                    intent="tertiary"
                    isDisabled={isPending || isBatchSending}
                    size="sm"
                    onClick={() => handleBatchResend(true)}
                  >
                    Force Resend All ({totalCount})
                  </Button>
                )}
              </>
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

        {/* Live Batch Dispatch Progress Tracker Banner */}
        {progress && (
          <div className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50/80 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>Sending Batch Payslip Emails...</span>
              <span>
                Step {progress.current} of {progress.total} (
                {Math.round((progress.current / progress.total) * 100)}%)
              </span>
            </div>
            {/* Animated Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
              />
            </div>
            <div className="text-[11px] font-medium text-blue-700">
              Currently sending to: <span className="font-bold text-blue-900">{progress.currentName}</span>
            </div>
          </div>
        )}

        {/* Included Payslips Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">Included Employee Payslips</h4>
            <span className="text-xs text-gray-500">
              {unsentCount > 0 ? (
                <span className="font-medium text-amber-700">{unsentCount} Unsent / Failed</span>
              ) : (
                <span className="font-medium text-green-700">All {totalCount} Emailed</span>
              )}
            </span>
          </div>
          <div className="max-h-[340px] overflow-y-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50 font-semibold text-gray-600">
                <tr>
                  <th className="p-2.5">Employee</th>
                  <th className="p-2.5 text-right">Gross</th>
                  <th className="p-2.5 text-right">Deductions</th>
                  <th className="p-2.5 text-right">Net Pay</th>
                  <th className="p-2.5 text-center">Email Delivery</th>
                  <th className="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {payslips.map((slip) => {
                  const empName = slip.employee
                    ? `${slip.employee.firstName} ${slip.employee.lastName}`
                    : 'Employee';
                  const isSendingThis = sendingSlipId === slip.id;

                  return (
                    <tr key={slip.id} className="hover:bg-gray-50/80">
                      <td className="p-2.5 font-medium text-gray-900">
                        <div>{empName}</div>
                        {slip.employee?.workEmail ? (
                          <div className="text-[10px] font-normal text-gray-500">
                            {slip.employee.workEmail}
                          </div>
                        ) : (
                          <div className="text-[10px] font-normal text-amber-600">No work email address</div>
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
                        <div className="flex flex-col items-center gap-0.5">
                          {getEmailStatusChip(slip.emailStatus, slip.emailError)}
                          {slip.emailError && (
                            <span
                              className="max-w-[140px] truncate text-[9px] text-red-500"
                              title={slip.emailError}
                            >
                              {slip.emailError}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Send Individual Email Button */}
                          <Button
                            aria-label="Send Payslip Email"
                            icon="refresh"
                            intent="tertiary"
                            isDisabled={isPending || Boolean(sendingSlipId) || isBatchSending}
                            isLoading={isSendingThis}
                            size="sm"
                            title={isSendingThis ? 'Sending email...' : 'Send Payslip Email'}
                            onClick={() => handleSendSingleEmail(slip.id, empName)}
                          />

                          {/* Download PDF Payslip */}
                          <Link href={API_ROUTES.downloadPayslip(slip.id)} target="_blank">
                            <Button aria-label="Download PDF" icon="document-text" intent="ghost" size="sm" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Modal>
  );
}
