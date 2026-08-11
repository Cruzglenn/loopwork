'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { type PayrollRunDto } from '@/api/hris/payroll/model/dtos';
import { Button, Chip } from '@/lib/ui';
import { parseDate } from '@/shared';
import { approvePayrollRunAction, markPayrollRunPaidAction } from '../_actions/manage-payroll-run.action';

type Props = {
  runs: PayrollRunDto[];
};

export function PayrollRunsList({ runs }: Props) {
  const [isPending, startTransition] = useTransition();

  if (!runs || runs.length === 0) {
    return null;
  }

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

  const handleApprove = (runId: string) => {
    startTransition(async () => {
      await approvePayrollRunAction(runId);
    });
  };

  const handleMarkPaid = (runId: string) => {
    startTransition(async () => {
      await markPayrollRunPaidAction(runId);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-gray-800">Payroll Runs & Batches</h3>
      {runs.map((run) => (
        <div
          key={run.id}
          className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md md:p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-900">{run.name}</span>
              {getStatusChip(run.status)}
            </div>
            <span className="text-sm font-medium text-gray-500">
              {parseDate(run.periodStart, 'MMM DD, YYYY')} - {parseDate(run.periodEnd, 'MMM DD, YYYY')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex flex-col rounded-lg bg-gray-50 p-2.5">
              <span className="text-xxs font-semibold uppercase text-gray-500">Gross Commitment</span>
              <span className="text-sm font-bold text-blue-600 sm:text-base">
                ₱{run.totalGross.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-gray-50 p-2.5">
              <span className="text-xxs font-semibold uppercase text-gray-500">Total Taxes & Deductions</span>
              <span className="text-sm font-bold text-red-600 sm:text-base">
                -₱{run.totalDeductions.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-gray-50 p-2.5">
              <span className="text-xxs font-semibold uppercase text-gray-500">Net Payout</span>
              <span className="text-sm font-bold text-green-600 sm:text-base">
                ₱{run.totalNet.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col rounded-lg bg-gray-50 p-2.5">
              <span className="text-xxs font-semibold uppercase text-gray-500">Employees Included</span>
              <span className="text-sm font-bold text-gray-700 sm:text-base">
                {run.totalPayslips} {run.totalPayslips === 1 ? 'employee' : 'employees'}
              </span>
            </div>
          </div>

          {/* Export & Governance Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
            {/* Multi-Format Export Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Export Bank Disbursement:</span>
              <div className="shadow-xs inline-flex rounded-md" role="group">
                <Link href={`/api/payroll/export-bank?runId=${run.id}&format=xlsx`} target="_blank">
                  <Button icon="arrow-down" intent="tertiary" size="sm">
                    Excel (.xlsx)
                  </Button>
                </Link>
                <Link href={`/api/payroll/export-bank?runId=${run.id}&format=csv`} target="_blank">
                  <Button icon="document-text" intent="tertiary" size="sm">
                    CSV
                  </Button>
                </Link>
                <Link href={`/api/payroll/export-bank?runId=${run.id}&format=pdf`} target="_blank">
                  <Button icon="document-text" intent="tertiary" size="sm">
                    PDF
                  </Button>
                </Link>
              </div>

              <span className="ml-2 text-xs font-semibold text-gray-600">Export GL Journal:</span>
              <div className="shadow-xs inline-flex rounded-md" role="group">
                <Link href={`/api/payroll/export-gl?runId=${run.id}&format=xlsx`} target="_blank">
                  <Button icon="arrow-down" intent="tertiary" size="sm">
                    Excel (.xlsx)
                  </Button>
                </Link>
                <Link href={`/api/payroll/export-gl?runId=${run.id}&format=csv`} target="_blank">
                  <Button icon="document-text" intent="tertiary" size="sm">
                    CSV
                  </Button>
                </Link>
                <Link href={`/api/payroll/export-gl?runId=${run.id}&format=pdf`} target="_blank">
                  <Button icon="document-text" intent="tertiary" size="sm">
                    PDF
                  </Button>
                </Link>
              </div>
            </div>

            {/* Governance Action Buttons */}
            <div className="flex items-center gap-2">
              {(run.status === 'DRAFT' || run.status === 'IN_REVIEW') && (
                <Button
                  intent="primary"
                  isDisabled={isPending}
                  size="sm"
                  onClick={() => handleApprove(run.id)}
                >
                  Approve & Lock Batch
                </Button>
              )}

              {run.status === 'APPROVED' && (
                <Button
                  intent="primary"
                  isDisabled={isPending}
                  size="sm"
                  onClick={() => handleMarkPaid(run.id)}
                >
                  Disburse & Mark Paid
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
