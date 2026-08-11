'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type PayrollRunDto } from '@/api/hris/payroll/model/dtos';
import { Button, Modal } from '@/lib/ui';
import { ModalHeader } from '@/lib/ui/components/modal/modal-header';

type Props = {
  run: PayrollRunDto | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ExportModal({ run, isOpen, onOpenChange }: Props) {
  const [exportType, setExportType] = useState<'bank' | 'gl'>('bank');
  const [format, setFormat] = useState<'xlsx' | 'csv' | 'pdf'>('xlsx');

  if (!run) return null;

  const downloadUrl = `/api/payroll/${exportType === 'bank' ? 'export-bank' : 'export-gl'}?runId=${run.id}&format=${format}`;

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalHeader title={`Export Financial Reports`} onClose={() => onOpenChange(false)} />

      <div className="flex flex-col gap-5 py-2">
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">Target Payroll Batch:</span> {run.name} (
          {run.totalPayslips} employees)
        </div>

        {/* 1. Select Export Type */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700">Report Category</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={`rounded-lg border p-3 text-left transition ${
                exportType === 'bank'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setExportType('bank')}
            >
              <div className="text-sm font-bold text-gray-900">Bank Disbursement</div>
              <div className="mt-0.5 text-xxs text-gray-500">
                Bulk payment advice for online banking upload
              </div>
            </button>

            <button
              className={`rounded-lg border p-3 text-left transition ${
                exportType === 'gl'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setExportType('gl')}
            >
              <div className="text-sm font-bold text-gray-900">GL Accounting Journal</div>
              <div className="mt-0.5 text-xxs text-gray-500">
                Balanced journal entries for QuickBooks/Xero/NetSuite
              </div>
            </button>
          </div>
        </div>

        {/* 2. Select File Format */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-700">File Format</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition ${
                format === 'xlsx'
                  ? 'bg-green-50/60 border-green-600 ring-2 ring-green-600/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setFormat('xlsx')}
            >
              <span className="text-sm font-bold text-green-700">Excel (.xlsx)</span>
              <span className="text-[10px] text-gray-500">Formatted Sheet</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition ${
                format === 'csv'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setFormat('csv')}
            >
              <span className="text-sm font-bold text-blue-700">CSV Data</span>
              <span className="text-[10px] text-gray-500">Plain Raw Text</span>
            </button>

            <button
              className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition ${
                format === 'pdf'
                  ? 'border-red-600 bg-red-50/60 ring-2 ring-red-600/20'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              type="button"
              onClick={() => setFormat('pdf')}
            >
              <span className="text-sm font-bold text-red-700">PDF Document</span>
              <span className="text-[10px] text-gray-500">Printable Report</span>
            </button>
          </div>
        </div>

        {/* Download Action Footer */}
        <div className="mt-2 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
          <Button intent="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Link href={downloadUrl} target="_blank" onClick={() => onOpenChange(false)}>
            <Button icon="arrow-down" intent="primary" size="sm">
              Download {format.toUpperCase()}
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
