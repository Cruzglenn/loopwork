import { getTranslations } from 'next-intl/server';
import { hrisApi } from '@/api/hris';
import { Card, NoResults, SearchInput } from '@/lib/ui';
import { BasicHeader } from '@/lib/ui/components/basic-header';
import { Pagination } from '@/lib/ui/components/pagination';
import { Stack } from '@/lib/ui/components/stack';
import { PayrollTable } from './_components/payroll-table';
import { PayrollGridList } from './_components/payroll-grid-list';
import { GeneratePayrollButton } from './_components/generate-payroll-button';

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    perPage?: string;
  }>;
};

export default async function CompanyPayrollPage({ searchParams }: Props) {
  const t = await getTranslations();
  const params = await searchParams;
  const page = params.page ? +params.page : 1;
  const perPage = params.perPage ? +params.perPage : 10;

  const overview = await hrisApi.payroll.getCompanyPayrollOverview(
    undefined,
    undefined,
    params.status,
    params.search,
    page,
    perPage,
  );

  return (
    <div className="flex min-h-full min-w-0 flex-1">
      <section className="relative z-10 min-w-0 flex-1 shadow-[0_4px_15px_0_rgba(39,55,75,0.06)]">
        <Card className="p-4 sm:p-6" id="ExpandableCard">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <BasicHeader>{t('payroll.header')}</BasicHeader>
            <GeneratePayrollButton />
          </div>

          <div className="min-h-full pt-2 md:pt-6">
            <div className="flex flex-col gap-6">
              {/* Summary Metrics Bar - Clean Responsive Card Tiles */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
                  <span className="text-xs font-medium text-gray-500">{t('payroll.metrics.totalGross')}</span>
                  <span className="text-base font-bold text-blue-600 sm:text-xl">
                    ${overview.totalGrossPay.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
                  <span className="text-xs font-medium text-gray-500">
                    {t('payroll.metrics.totalDeductions')}
                  </span>
                  <span className="text-base font-bold text-red-600 sm:text-xl">
                    -${overview.totalDeductions.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
                  <span className="text-xs font-medium text-gray-500">{t('payroll.metrics.totalNet')}</span>
                  <span className="text-base font-bold text-green-600 sm:text-xl">
                    ${overview.totalNetPay.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
                  <span className="text-xs font-medium text-gray-500">
                    {t('payroll.metrics.totalPayslips')}
                  </span>
                  <span className="text-base font-bold text-gray-700 sm:text-xl">
                    {overview.totalPayslips}
                  </span>
                </div>
              </div>

              <Stack className="w-full flex-wrap justify-between" gapY="md">
                <SearchInput className="w-full max-w-sm" />
              </Stack>

              {overview.payslips.length === 0 ? (
                <NoResults />
              ) : (
                <>
                  <PayrollTable className="hidden xl:table" payslips={overview.payslips} />
                  <PayrollGridList className="xl:hidden" payslips={overview.payslips} />
                  <Pagination
                    nextPage={overview.nextPage}
                    prevPage={overview.prevPage}
                    totalPages={overview.totalPages}
                  />
                </>
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
