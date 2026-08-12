'use client';

import { type PayrollRunDto } from '@/api/hris/payroll/model/dtos';
import { Button, Chip } from '@/lib/ui';
import { parseDate, type PropsWithClassName, cn } from '@/shared';

type Props = {
  runs: PayrollRunDto[];
  onSelectRunDetails: (run: PayrollRunDto) => void;
  onSelectRunExport: (run: PayrollRunDto) => void;
  onApprove: (runId: string) => void;
  onMarkPaid: (runId: string) => void;
  isPending: boolean;
};

export function PayrollRunsGridList({
  runs,
  onSelectRunDetails,
  onSelectRunExport,
  onApprove,
  onMarkPaid,
  isPending,
  className,
}: PropsWithClassName<Props>): JSX.Element {
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Chip intent="ok">APPROVED</Chip>;
      case 'PAID':
        return <Chip intent="info">PAID</Chip>;
      case 'IN_REVIEW':
        return <Chip intent="warning">IN REVIEW</Chip>;
      case 'DRAFT':
      default:
        return <Chip intent="warning">DRAFT</Chip>;
    }
  };

  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      {runs.map((run) => (
        <div
          key={run.id}
          className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300"
        >
          {/* Card Header: Run Name & Status */}
          <div className="flex items-start justify-between gap-2">
            <button
              className="text-left text-sm font-bold leading-tight text-gray-900 transition hover:text-blue-600"
              type="button"
              onClick={() => onSelectRunDetails(run)}
            >
              {run.name}
            </button>
            <div className="shrink-0">{getStatusChip(run.status)}</div>
          </div>

          {/* Period & Employees Meta Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-2 text-xs text-gray-500">
            <span>
              Period:{' '}
              <strong className="font-medium text-gray-700">
                {parseDate(run.periodStart, 'MMM DD')} - {parseDate(run.periodEnd, 'MMM DD, YYYY')}
              </strong>
            </span>
            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
              {run.totalPayslips} Employees
            </span>
          </div>

          {/* Financial Summary Breakdown */}
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50/80 p-2.5 text-center text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase text-gray-400">Gross</span>
              <span className="font-semibold text-gray-800">₱{run.totalGross.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase text-gray-400">Deductions</span>
              <span className="font-semibold text-red-600">-₱{run.totalDeductions.toLocaleString()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase text-gray-400">Net Pay</span>
              <span className="font-bold text-green-600">₱{run.totalNet.toLocaleString()}</span>
            </div>
          </div>

          {/* Card Actions Footer */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              <Button
                aria-label="View Details"
                icon="eye"
                intent="tertiary"
                size="sm"
                onClick={() => onSelectRunDetails(run)}
              >
                Details
              </Button>
              <Button
                aria-label="Export Financial Reports"
                icon="arrow-down"
                intent="tertiary"
                size="sm"
                onClick={() => onSelectRunExport(run)}
              >
                Export
              </Button>
            </div>

            <div>
              {(run.status === 'DRAFT' || run.status === 'IN_REVIEW') && (
                <Button intent="primary" isDisabled={isPending} size="sm" onClick={() => onApprove(run.id)}>
                  Approve
                </Button>
              )}

              {run.status === 'APPROVED' && (
                <Button intent="primary" isDisabled={isPending} size="sm" onClick={() => onMarkPaid(run.id)}>
                  Disburse
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
