'use client';

import { useState, useTransition } from 'react';
import { type PayrollRunDto } from '@/api/hris/payroll/model/dtos';
import { Button, Cell, Column, Row, Table, TableBody, TableHeader, Chip } from '@/lib/ui';
import { type Columns, parseDate } from '@/shared';
import { approvePayrollRunAction, markPayrollRunPaidAction } from '../_actions/manage-payroll-run.action';
import { ExportModal } from './export-modal';
import { PayrollRunDetailsModal } from './payroll-run-details-modal';

type Props = {
  runs: PayrollRunDto[];
};

const RUN_COLUMNS: Columns = {
  name: { label: 'payroll.runs.batchName' },
  period: { label: 'payroll.runs.period' },
  employees: { label: 'payroll.runs.employees' },
  gross: { label: 'payroll.runs.grossPay' },
  deductions: { label: 'payroll.runs.deductions' },
  net: { label: 'payroll.runs.netPayout' },
  status: { label: 'payroll.runs.status' },
};

export function PayrollRunsTable({ runs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedRunDetails, setSelectedRunDetails] = useState<PayrollRunDto | null>(null);
  const [selectedRunExport, setSelectedRunExport] = useState<PayrollRunDto | null>(null);

  if (!runs || runs.length === 0) {
    return null;
  }

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

  const currentSelectedRun = runs.find((r) => r.id === selectedRunDetails?.id) || selectedRunDetails;

  return (
    <>
      <div className="shadow-xs overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Table aria-label="Payroll Runs & Batches">
          <TableHeader columns={RUN_COLUMNS}>
            <Column aria-label="Actions" />
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <Row key={run.id} id={run.id}>
                <Cell truncate={false}>
                  <button
                    className="text-left font-bold text-gray-900 transition hover:text-blue-600"
                    type="button"
                    onClick={() => setSelectedRunDetails(run)}
                  >
                    {run.name}
                  </button>
                </Cell>
                <Cell className="min-w-44 text-xs text-gray-600" truncate={false}>
                  {parseDate(run.periodStart, 'MMM DD')} - {parseDate(run.periodEnd, 'MMM DD, YYYY')}
                </Cell>
                <Cell truncate={false}>
                  <span className="font-semibold text-gray-700">{run.totalPayslips}</span>
                </Cell>
                <Cell truncate={false}>₱{run.totalGross.toLocaleString()}</Cell>
                <Cell className="text-red-600" truncate={false}>
                  -₱{run.totalDeductions.toLocaleString()}
                </Cell>
                <Cell className="font-bold text-green-600" truncate={false}>
                  ₱{run.totalNet.toLocaleString()}
                </Cell>
                <Cell truncate={false}>{getStatusChip(run.status)}</Cell>

                {/* Actions Column */}
                <Cell className="pr-2 text-right" truncate={false}>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details Button */}
                    <Button
                      aria-label="View Details"
                      icon="eye"
                      intent="tertiary"
                      size="sm"
                      onClick={() => setSelectedRunDetails(run)}
                    />

                    {/* Export Financial Reports Button */}
                    <Button
                      aria-label="Export Financial Reports"
                      icon="arrow-down"
                      intent="tertiary"
                      size="sm"
                      onClick={() => setSelectedRunExport(run)}
                    />

                    {/* Approve Governance Action */}
                    {(run.status === 'DRAFT' || run.status === 'IN_REVIEW') && (
                      <Button
                        intent="primary"
                        isDisabled={isPending}
                        size="sm"
                        onClick={() => handleApprove(run.id)}
                      >
                        Approve
                      </Button>
                    )}

                    {/* Mark Paid Governance Action */}
                    {run.status === 'APPROVED' && (
                      <Button
                        intent="primary"
                        isDisabled={isPending}
                        size="sm"
                        onClick={() => handleMarkPaid(run.id)}
                      >
                        Disburse
                      </Button>
                    )}
                  </div>
                </Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Slide-Over / Modal */}
      <PayrollRunDetailsModal
        isOpen={Boolean(selectedRunDetails)}
        run={currentSelectedRun}
        onOpenChange={(open) => !open && setSelectedRunDetails(null)}
        onOpenExport={(run) => setSelectedRunExport(run)}
      />

      {/* Export Format Selection Modal */}
      <ExportModal
        isOpen={Boolean(selectedRunExport)}
        run={selectedRunExport}
        onOpenChange={(open) => !open && setSelectedRunExport(null)}
      />
    </>
  );
}
