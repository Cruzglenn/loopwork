'use client';

import { useTranslations } from 'use-intl';
import { type AttendanceLogDto } from '@/api/hris/attendance/model/dtos';
import { Cell, Row, Table, TableBody, TableHeader, Chip } from '@/lib/ui';
import { type Columns, parseDate } from '@/shared';

type Props = {
  logs: AttendanceLogDto[];
  dateFormat: string;
};

const ATTENDANCE_COLUMNS: Columns = {
  employee: { label: 'attendance.table.employee' },
  clockIn: { label: 'attendance.table.clockIn' },
  clockOut: { label: 'attendance.table.clockOut' },
  workTime: { label: 'attendance.table.workTime' },
  breakTime: { label: 'attendance.table.breakTime' },
  status: { label: 'attendance.table.status' },
  notes: { label: 'attendance.table.notes' },
};

export function AttendanceTable({ logs }: Props): JSX.Element {
  const t = useTranslations();

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
    <Table aria-label={t('attendance.title')}>
      <TableHeader columns={ATTENDANCE_COLUMNS} />
      <TableBody>
        {logs.map((item) => (
          <Row key={item.id} id={item.id}>
            <Cell>
              <span className="font-medium">
                {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
              </span>
            </Cell>
            <Cell>{formatTime(item.clockIn)}</Cell>
            <Cell>{formatTime(item.clockOut)}</Cell>
            <Cell>{formatMinutes(item.totalWorkMinutes)}</Cell>
            <Cell>{formatMinutes(item.totalBreakMinutes)}</Cell>
            <Cell>{getStatusChip(item.status)}</Cell>
            <Cell>{item.notes || '-'}</Cell>
          </Row>
        ))}
      </TableBody>
    </Table>
  );
}
