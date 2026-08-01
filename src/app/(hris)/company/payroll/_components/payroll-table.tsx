'use client';

import Link from 'next/link';
import { useTranslations } from 'use-intl';
import { type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { Cell, Row, Table, TableBody, TableHeader, Chip, Button, Icon } from '@/lib/ui';
import { type Columns, parseDate, API_ROUTES } from '@/shared';

type Props = {
  payslips: PayslipDto[];
};

const PAYROLL_COLUMNS: Columns = {
  employee: { label: 'payroll.table.employee' },
  period: { label: 'payroll.table.period' },
  grossPay: { label: 'payroll.table.grossPay' },
  deductions: { label: 'payroll.table.deductions' },
  netPay: { label: 'payroll.table.netPay' },
  status: { label: 'payroll.table.status' },
  actions: { label: 'payroll.table.actions' },
};

export function PayrollTable({ payslips }: Props): JSX.Element {
  const t = useTranslations();

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Chip intent="ok">{t('payroll.status.approved')}</Chip>;
      case 'PAID':
        return <Chip intent="info">{t('payroll.status.paid')}</Chip>;
      case 'DRAFT':
      default:
        return <Chip intent="warning">{t('payroll.status.draft')}</Chip>;
    }
  };

  return (
    <Table aria-label={t('payroll.title')}>
      <TableHeader columns={PAYROLL_COLUMNS} />
      <TableBody>
        {payslips.map((item) => (
          <Row key={item.id} id={item.id}>
            <Cell>
              <span className="font-medium">
                {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
              </span>
            </Cell>
            <Cell>
              {parseDate(item.periodStart, 'MMM DD')} - {parseDate(item.periodEnd, 'MMM DD, YYYY')}
            </Cell>
            <Cell>${item.grossPay.toLocaleString()}</Cell>
            <Cell className="text-red-600">-${item.deductionsTotal.toLocaleString()}</Cell>
            <Cell className="font-bold text-blue-600">${item.netPay.toLocaleString()}</Cell>
            <Cell>{getStatusChip(item.status)}</Cell>
            <Cell>
              <Link href={API_ROUTES.downloadPayslip(item.id)} target="_blank">
                <Button intent="tertiary" size="sm">
                  <Icon name="document-text" size="xs" />
                  {t('payroll.table.downloadPdf')}
                </Button>
              </Link>
            </Cell>
          </Row>
        ))}
      </TableBody>
    </Table>
  );
}
