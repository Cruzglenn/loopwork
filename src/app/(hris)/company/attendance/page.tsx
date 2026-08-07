import { getTranslations } from 'next-intl/server';
import { hrisApi } from '@/api/hris';
import { Card, NoResults } from '@/lib/ui';
import { BasicHeader } from '@/lib/ui/components/basic-header';
import { AttendanceTable } from './_components/attendance-table';
import { AttendanceGridList } from './_components/attendance-grid-list';
import { AttendanceFilters } from './_components/attendance-filters';

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
};

export default async function CompanyAttendancePage({ searchParams }: Props) {
  const t = await getTranslations();
  const params = await searchParams;

  const today = new Date();
  const overview = await hrisApi.attendance.getCompanyOverview(today, params.search, params.status);

  return (
    <Card className="flex flex-col gap-6 p-4 sm:p-6">
      <BasicHeader>{t('attendance.header')}</BasicHeader>

      {/* Summary Metrics Bar - Clean Responsive Card Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
          <span className="text-xs font-medium text-gray-500">{t('attendance.metrics.activeEmployees')}</span>
          <span className="text-base font-bold text-blue-600 sm:text-xl">{overview.totalEmployees}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
          <span className="text-xs font-medium text-gray-500">{t('attendance.status.clockedIn')}</span>
          <span className="text-base font-bold text-green-600 sm:text-xl">{overview.clockedInCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
          <span className="text-xs font-medium text-gray-500">{t('attendance.metrics.onBreakCount')}</span>
          <span className="text-base font-bold text-amber-600 sm:text-xl">{overview.onBreakCount}</span>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50/60 p-3 text-center">
          <span className="text-xs font-medium text-gray-500">{t('attendance.status.clockedOut')}</span>
          <span className="text-base font-bold text-gray-700 sm:text-xl">{overview.clockedOutCount}</span>
        </div>
      </div>

      <AttendanceFilters />

      {overview.logs.length === 0 ? (
        <NoResults />
      ) : (
        <>
          <div className="hidden xl:block">
            <AttendanceTable dateFormat="MM/DD/YYYY" logs={overview.logs} />
          </div>
          <div className="xl:hidden">
            <AttendanceGridList logs={overview.logs} />
          </div>
        </>
      )}
    </Card>
  );
}
