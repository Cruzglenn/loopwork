'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'use-intl';
import { type AttendanceLogDto } from '@/api/hris/attendance/model/dtos';
import { Button, Card, Chip, Icon } from '@/lib/ui';
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
      <Card className="flex flex-col gap-4 border border-gray-200 bg-gray-50/70 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Icon name="clock" size="2xl" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-gray-500 sm:text-sm">{t('attendance.title')}</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold sm:text-lg">
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
          </div>

          {canLogManual && (
            <Button
              className="w-full sm:w-auto"
              intent="secondary"
              type="button"
              onClick={() => setShowManualForm((prev) => !prev)}
            >
              <Icon className="mr-1.5" name="edit-2" />
              {showManualForm ? 'Cancel Manual Adjustment' : 'Log Manual Timecard'}
            </Button>
          )}
        </div>

        {showManualForm && canLogManual && (
          <form
            action={handleManualSubmit}
            className="mt-2 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
          >
            <h4 className="text-sm font-semibold text-gray-800">Admin Manual Timecard Entry</h4>
            <input name="employeeId" type="hidden" value={employeeId} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Date</label>
                <input
                  required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  name="date"
                  type="date"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Clock In Time</label>
                <input
                  required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  defaultValue="09:00"
                  name="clockIn"
                  type="time"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Clock Out Time</label>
                <input
                  required
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  defaultValue="17:00"
                  name="clockOut"
                  type="time"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Break Duration (Minutes)</label>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  defaultValue={60}
                  min={0}
                  name="breakMinutes"
                  type="number"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Audit Notes / Reason</label>
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  name="notes"
                  placeholder="e.g. Forgot to clock out"
                  type="text"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
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
    <Card className="flex flex-col gap-4 border border-gray-200 bg-gray-50/70 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Icon name="clock" size="2xl" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-gray-500 sm:text-sm">{t('attendance.title')}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold sm:text-lg">
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
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {!isClockedIn && !isOnBreak && (
            <Button
              className="w-full sm:w-auto"
              intent="primary"
              isLoading={isPending}
              onClick={handleClockIn}
            >
              {t('attendance.clockIn')}
            </Button>
          )}

          {isClockedIn && (
            <>
              <Button
                className="w-full sm:w-auto"
                intent="secondary"
                isLoading={isPending}
                onClick={handleStartBreak}
              >
                {t('attendance.startBreak')}
              </Button>
              <Button
                className="w-full sm:w-auto"
                intent="danger"
                isLoading={isPending}
                onClick={handleClockOut}
              >
                {t('attendance.clockOut')}
              </Button>
            </>
          )}

          {isOnBreak && (
            <>
              <Button
                className="w-full sm:w-auto"
                intent="primary"
                isLoading={isPending}
                onClick={handleEndBreak}
              >
                {t('attendance.endBreak')}
              </Button>
              <Button
                className="w-full sm:w-auto"
                intent="danger"
                isLoading={isPending}
                onClick={handleClockOut}
              >
                {t('attendance.clockOut')}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
