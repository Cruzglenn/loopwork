import { getTranslations } from 'next-intl/server';
import { hrisApi } from '@/api/hris';
import { Card, Table, TableHeader, TableBody, Row, Cell, Chip, NoResults } from '@/lib/ui';
import { parseDate, type Columns } from '@/shared';
import { getPermissionChecker } from '@/api/hris/authorization';
import { PermissionAction, ResourceType } from '@/api/hris/authorization/permissions';
import { ClockControlBanner } from './_components/clock-control-banner';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const WEEKLY_LOG_COLUMNS: Columns = {
  date: { label: 'attendance.table.date' },
  clockIn: { label: 'attendance.table.clockIn' },
  clockOut: { label: 'attendance.table.clockOut' },
  workTime: { label: 'attendance.table.workTime' },
  breakTime: { label: 'attendance.table.breakTime' },
  status: { label: 'attendance.table.status' },
};

export default async function EmployeeAttendancePage({ params }: Props) {
  const { id: employeeId } = await params;
  const t = await getTranslations();

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - 7);

  const [me, permissionChecker, activeLog, logs] = await Promise.all([
    hrisApi.auth.getMe(),
    getPermissionChecker(),
    hrisApi.attendance.getTodayStatus(employeeId),
    hrisApi.attendance.getEmployeeWeeklyLogs(employeeId, startOfWeek, today),
  ]);

  const isSelf = me.id === employeeId;
  const canLogManual = permissionChecker.can(ResourceType.COMPANY_ATTENDANCE, PermissionAction.CREATE);

  const formatTime = (date: Date | string | null) => {
    if (!date) return '-';
    return parseDate(date, 'HH:mm');
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
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
    <div className="flex flex-col gap-6">
      <ClockControlBanner
        activeLog={activeLog}
        canLogManual={canLogManual}
        employeeId={employeeId}
        isSelf={isSelf}
      />

      <Card className="flex flex-col gap-4 p-6">
        <h3 className="text-lg font-semibold">{t('attendance.tabs.weekly')}</h3>

        {logs.length === 0 ? (
          <NoResults />
        ) : (
          <Table aria-label={t('attendance.tabs.weekly')}>
            <TableHeader columns={WEEKLY_LOG_COLUMNS} />
            <TableBody>
              {logs.map((item) => (
                <Row key={item.id} id={item.id}>
                  <Cell>{parseDate(item.date, 'MMM DD, YYYY')}</Cell>
                  <Cell>{formatTime(item.clockIn)}</Cell>
                  <Cell>{formatTime(item.clockOut)}</Cell>
                  <Cell>{formatMinutes(item.totalWorkMinutes)}</Cell>
                  <Cell>{formatMinutes(item.totalBreakMinutes)}</Cell>
                  <Cell>{getStatusChip(item.status)}</Cell>
                </Row>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
