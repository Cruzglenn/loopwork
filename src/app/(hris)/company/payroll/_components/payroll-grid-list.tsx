'use client';

import Link from 'next/link';
import { useTranslations } from 'use-intl';
import { type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { GridList, GridListItem, Chip, Button } from '@/lib/ui';
import { parseDate, API_ROUTES, type PropsWithClassName, cn } from '@/shared';

type Props = {
  payslips: PayslipDto[];
};

export function PayrollGridList({ payslips, className }: PropsWithClassName<Props>): JSX.Element {
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
    <GridList
      aria-label={t('payroll.title')}
      className={cn(className)}
      items={payslips}
      searchParamKey="PAYROLL"
    >
      {(item) => (
        <GridListItem
          key={item.id}
          className="border-b border-divider py-3"
          id={item.id}
          textValue={item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
        >
          <div className="flex w-full flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-900">
                {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
              </span>
              <span className="text-xs text-gray-500">
                {parseDate(item.periodStart, 'MMM DD')} - {parseDate(item.periodEnd, 'MMM DD, YYYY')}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
                <span>
                  Gross: <strong className="text-gray-700">₱{item.grossPay.toLocaleString()}</strong>
                </span>
                <span>
                  Deductions:{' '}
                  <strong className="text-red-600">-₱{item.deductionsTotal.toLocaleString()}</strong>
                </span>
                <span>
                  Net: <strong className="text-blue-600">₱{item.netPay.toLocaleString()}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              {getStatusChip(item.status)}
              <Link href={API_ROUTES.downloadPayslip(item.id)} target="_blank">
                <Button icon="document-text" intent="tertiary" size="sm">
                  {t('payroll.table.downloadPdf')}
                </Button>
              </Link>
            </div>
          </div>
        </GridListItem>
      )}
    </GridList>
  );
}
