'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'use-intl';
import { type AttendanceLogDto } from '@/api/hris/attendance/model/dtos';
import { Button, Card, Chip, Icon } from '@/lib/ui';
import { Stack } from '@/lib/ui/components/stack';
import { logManualAttendanceAction } from '@/app/(hris)/company/attendance/_actions/log-manual-attendance.action';
import { clockInAction, clockOutAction, startBreakAction, endBreakAction } from '../_actions/clock-actions';

type Props = {
  employeeId: string;
  activeLog: AttendanceLogDto | null;
  isSelf?: boolean;
  canLogManual?: boolean;
};

export function ClockControlBanner({
  employeeId,
  activeLog,
  isSelf = true,
  canLogManual = false,
}: Props): JSX.Element {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [showManualForm, setShowManualForm] = useState(false);

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

  const handleManualSubmit = (formData: FormData) => {
    startTransition(async () => {
      await logManualAttendanceAction(
        { status: 'idle', form: { employeeId: '', date: '', clockIn: '', clockOut: '' } },
        formData,
      );
      setShowManualForm(false);
    });
  };

  if (!isSelf) {
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

          {canLogManual && (
            <Button intent="secondary" type="button" onClick={() => setShowManualForm((prev) => !prev)}>
              <Icon className="mr-1.5" name="edit-2" />
              {showManualForm ? 'Cancel Manual Adjustment' : 'Log Manual Timecard'}
            </Button>
          )}
        </div>

        {showManualForm && canLogManual && (
          <form
            action={handleManualSubmit}
            className="mt-4 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4"
          >
            <h4 className="text-sm font-semibold text-gray-700">Admin Manual Timecard Entry</h4>
            <input name="employeeId" type="hidden" value={employeeId} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Date</label>
                <input
                  required
                  className="rounded-md border border-gray-300 p-2 text-sm"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  name="date"
                  type="date"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Clock In Time</label>
                <input
                  required
                  className="rounded-md border border-gray-300 p-2 text-sm"
                  defaultValue="09:00"
                  name="clockIn"
                  type="time"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Clock Out Time</label>
                <input
                  required
                  className="rounded-md border border-gray-300 p-2 text-sm"
                  defaultValue="17:00"
                  name="clockOut"
                  type="time"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Break Duration (Minutes)</label>
                <input
                  className="rounded-md border border-gray-300 p-2 text-sm"
                  defaultValue={60}
                  min={0}
                  name="breakMinutes"
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Audit Notes / Reason</label>
                <input
                  className="rounded-md border border-gray-300 p-2 text-sm"
                  name="notes"
                  placeholder="e.g. Forgot to clock out"
                  type="text"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button intent="primary" isLoading={isPending} type="submit">
                Save Timecard Adjustment
              </Button>
            </div>
          </form>
        )}
      </Card>
    );
  }

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
