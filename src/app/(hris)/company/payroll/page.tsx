import { getTranslations } from 'next-intl/server';
import { hrisApi } from '@/api/hris';
import { Card, NoResults, SearchInput } from '@/lib/ui';
import { BasicHeader } from '@/lib/ui/components/basic-header';
import { Stack } from '@/lib/ui/components/stack';
import { PayrollTable } from './_components/payroll-table';
import { PayrollGridList } from './_components/payroll-grid-list';
import { GeneratePayrollButton } from './_components/generate-payroll-button';

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
};

export default async function CompanyPayrollPage({ searchParams }: Props) {
  const t = await getTranslations();
  const params = await searchParams;

  const overview = await hrisApi.payroll.getCompanyPayrollOverview(
    undefined,
    undefined,
    params.status,
    params.search,
  );

  return (
    <Card className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BasicHeader>{t('payroll.header')}</BasicHeader>
        <GeneratePayrollButton />
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 divide-x divide-gray-200 rounded-lg border border-gray-200 bg-gray-50/50 py-3 sm:grid-cols-4">
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-xs font-medium text-gray-500">{t('payroll.metrics.totalGross')}</span>
          <span className="text-xl font-bold text-blue-600">${overview.totalGrossPay.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-xs font-medium text-gray-500">{t('payroll.metrics.totalDeductions')}</span>
          <span className="text-xl font-bold text-red-600">
            -${overview.totalDeductions.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-xs font-medium text-gray-500">{t('payroll.metrics.totalNet')}</span>
          <span className="text-xl font-bold text-green-600">${overview.totalNetPay.toLocaleString()}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 text-center">
          <span className="text-xs font-medium text-gray-500">{t('payroll.metrics.totalPayslips')}</span>
          <span className="text-xl font-bold text-gray-700">{overview.totalPayslips}</span>
        </div>
      </div>

      <Stack className="w-full flex-wrap justify-between" gapY="md">
        <SearchInput className="w-full max-w-sm" />
      </Stack>

      {overview.payslips.length === 0 ? (
        <NoResults />
      ) : (
        <>
          <div className="hidden xl:block">
            <PayrollTable payslips={overview.payslips} />
          </div>
          <div className="xl:hidden">
            <PayrollGridList payslips={overview.payslips} />
          </div>
        </>
      )}
    </Card>
  );
}
