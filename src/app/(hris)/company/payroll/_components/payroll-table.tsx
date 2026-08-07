'use client';

import Link from 'next/link';
import { useTranslations } from 'use-intl';
import { type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { Cell, Column, Row, Table, TableBody, TableHeader, Chip, Button } from '@/lib/ui';
import { type Columns, parseDate, API_ROUTES, type PropsWithClassName, cn } from '@/shared';

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
};

export function PayrollTable({ payslips, className }: PropsWithClassName<Props>): JSX.Element {
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
    <Table aria-label={t('payroll.title')} className={cn(className)}>
      <TableHeader columns={PAYROLL_COLUMNS}>
        <Column />
      </TableHeader>
      <TableBody>
        {payslips.map((item) => (
          <Row key={item.id} id={item.id}>
            <Cell truncate={false}>
              <span className="font-medium">
                {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
              </span>
            </Cell>
            <Cell className="min-w-44" truncate={false}>
              {parseDate(item.periodStart, 'MMM DD')} - {parseDate(item.periodEnd, 'MMM DD, YYYY')}
            </Cell>
            <Cell truncate={false}>₱{item.grossPay.toLocaleString()}</Cell>
            <Cell className="text-red-600" truncate={false}>
              -₱{item.deductionsTotal.toLocaleString()}
            </Cell>
            <Cell className="font-bold text-blue-600" truncate={false}>
              ₱{item.netPay.toLocaleString()}
            </Cell>
            <Cell truncate={false}>{getStatusChip(item.status)}</Cell>
            <Cell className="pr-0 text-right" truncate={false}>
              <Link href={API_ROUTES.downloadPayslip(item.id)} target="_blank">
                <Button icon="document-text" intent="tertiary" size="sm">
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
