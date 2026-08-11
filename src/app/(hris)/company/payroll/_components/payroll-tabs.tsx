'use client';

import { useState } from 'react';
import { type PayrollRunDto, type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { NoResults, SearchInput } from '@/lib/ui';
import { Pagination } from '@/lib/ui/components/pagination';
import { Stack } from '@/lib/ui/components/stack';
import { PayrollRunsTable } from './payroll-runs-table';
import { PayrollTable } from './payroll-table';
import { PayrollGridList } from './payroll-grid-list';

type Props = {
  runs: PayrollRunDto[];
  payslips: PayslipDto[];
  nextPage: number | null;
  prevPage: number | null;
  totalPages: number;
};

export function PayrollTabs({ runs, payslips, nextPage, prevPage, totalPages }: Props) {
  const [activeTab, setActiveTab] = useState<'runs' | 'payslips'>('runs');

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Navigation Header */}
      <div className="flex gap-x-6 border-b border-gray-200">
        <button
          className={`border-b-2 pb-3 text-sm font-semibold transition ${
            activeTab === 'runs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          type="button"
          onClick={() => setActiveTab('runs')}
        >
          Payroll Runs ({runs.length})
        </button>

        <button
          className={`border-b-2 pb-3 text-sm font-semibold transition ${
            activeTab === 'payslips'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          type="button"
          onClick={() => setActiveTab('payslips')}
        >
          All Individual Payslips ({payslips.length})
        </button>
      </div>

      {/* Tab 1: Payroll Batches Data Table */}
      {activeTab === 'runs' && (
        <div className="flex flex-col gap-4">
          {runs.length === 0 ? <NoResults /> : <PayrollRunsTable runs={runs} />}
        </div>
      )}

      {/* Tab 2: Individual Employee Payslips */}
      {activeTab === 'payslips' && (
        <div className="flex flex-col gap-4">
          <Stack className="w-full flex-wrap justify-between" gapY="md">
            <SearchInput className="w-full max-w-sm" />
          </Stack>

          {payslips.length === 0 ? (
            <NoResults />
          ) : (
            <>
              <PayrollTable className="hidden xl:table" payslips={payslips} />
              <PayrollGridList className="xl:hidden" payslips={payslips} />
              <Pagination nextPage={nextPage} prevPage={prevPage} totalPages={totalPages} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
