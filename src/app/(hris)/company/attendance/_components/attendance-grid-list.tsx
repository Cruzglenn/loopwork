'use client';

import { useTranslations } from 'use-intl';
import { type AttendanceLogDto } from '@/api/hris/attendance/model/dtos';
import { GridList, GridListItem, Chip } from '@/lib/ui';
import { parseDate } from '@/shared';

type Props = {
  logs: AttendanceLogDto[];
};

export function AttendanceGridList({ logs }: Props): JSX.Element {
  const t = useTranslations();

  const formatTime = (date: Date | string | null) => {
    if (!date) return '-';
    return parseDate(date, 'HH:mm');
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'CLOCKED_IN':
        return <Chip intent="ok">{t('attendance.status.clockedIn')}</Chip>;
      case 'ON_BREAK':
        return <Chip intent="warning">{t('attendance.status.onBreak')}</Chip>;
      case 'CLOCKED_OUT':
        return <Chip intent="info">{t('attendance.status.clockedOut')}</Chip>;
      default:
        return <Chip intent="info">{status}</Chip>;
    }
  };

  return (
    <GridList aria-label={t('attendance.title')} items={logs} searchParamKey="ATTENDANCE">
      {(item) => (
        <GridListItem key={item.id} id={item.id}>
          <div className="flex w-full items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
              </span>
              <span className="text-xs text-gray-500">
                In: {formatTime(item.clockIn)} | Out: {formatTime(item.clockOut)}
              </span>
            </div>
            <div>{getStatusChip(item.status)}</div>
          </div>
        </GridListItem>
      )}
    </GridList>
  );
}
