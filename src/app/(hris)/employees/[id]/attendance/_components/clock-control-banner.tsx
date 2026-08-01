'use client';

import { useTransition } from 'react';
import { useTranslations } from 'use-intl';
import { type AttendanceLogDto } from '@/api/hris/attendance/model/dtos';
import { Button, Card, Chip, Icon } from '@/lib/ui';
import { Stack } from '@/lib/ui/components/stack';
import { clockInAction, clockOutAction, startBreakAction, endBreakAction } from '../_actions/clock-actions';

type Props = {
  employeeId: string;
  activeLog: AttendanceLogDto | null;
};

export function ClockControlBanner({ employeeId, activeLog }: Props): JSX.Element {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const isClockedIn = activeLog?.status === 'CLOCKED_IN';
  const isOnBreak = activeLog?.status === 'ON_BREAK';

  const handleClockIn = () => {
    startTransition(async () => {
      await clockInAction(employeeId);
    });
  };

  const handleClockOut = () => {
    startTransition(async () => {
      await clockOutAction(employeeId);
    });
  };

  const handleStartBreak = () => {
    startTransition(async () => {
      await startBreakAction(employeeId, 'LUNCH');
    });
  };

  const handleEndBreak = () => {
    startTransition(async () => {
      await endBreakAction(employeeId);
    });
  };

  return (
    <Card className="flex flex-col gap-4 border border-gray-200 bg-gray-50/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Stack gapX="md">
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Icon name="clock" size="2xl" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">{t('attendance.title')}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                {isClockedIn
                  ? t('attendance.status.clockedIn')
                  : isOnBreak
                    ? t('attendance.status.onBreak')
                    : t('attendance.status.clockedOut')}
              </span>
              {isClockedIn && <Chip intent="ok">{t('attendance.status.clockedIn')}</Chip>}
              {isOnBreak && <Chip intent="warning">{t('attendance.status.onBreak')}</Chip>}
              {!isClockedIn && !isOnBreak && <Chip intent="info">{t('attendance.status.clockedOut')}</Chip>}
            </div>
          </div>
        </Stack>

        <Stack gapX="sm">
          {!isClockedIn && !isOnBreak && (
            <Button intent="primary" isLoading={isPending} onClick={handleClockIn}>
              {t('attendance.clockIn')}
            </Button>
          )}

          {isClockedIn && (
            <>
              <Button intent="secondary" isLoading={isPending} onClick={handleStartBreak}>
                {t('attendance.startBreak')}
              </Button>
              <Button intent="danger" isLoading={isPending} onClick={handleClockOut}>
                {t('attendance.clockOut')}
              </Button>
            </>
          )}

          {isOnBreak && (
            <>
              <Button intent="primary" isLoading={isPending} onClick={handleEndBreak}>
                {t('attendance.endBreak')}
              </Button>
              <Button intent="danger" isLoading={isPending} onClick={handleClockOut}>
                {t('attendance.clockOut')}
              </Button>
            </>
          )}
        </Stack>
      </div>
    </Card>
  );
}
