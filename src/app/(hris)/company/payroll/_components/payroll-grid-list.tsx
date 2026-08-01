'use client';

import Link from 'next/link';
import { useTranslations } from 'use-intl';
import { type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { GridList, GridListItem, Chip, Button, Icon } from '@/lib/ui';
import { parseDate, API_ROUTES } from '@/shared';

type Props = {
  payslips: PayslipDto[];
};

export function PayrollGridList({ payslips }: Props): JSX.Element {
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
    <GridList aria-label={t('payroll.title')} items={payslips} searchParamKey="PAYROLL">
      {(item) => (
        <GridListItem key={item.id} id={item.id}>
          <div className="flex w-full items-center justify-between p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">
                {item.employee ? `${item.employee.firstName} ${item.employee.lastName}` : 'Employee'}
              </span>
              <span className="text-xs text-gray-500">
                Net Pay: ${item.netPay.toLocaleString()} | {parseDate(item.periodStart, 'MMM DD')} -{' '}
                {parseDate(item.periodEnd, 'MMM DD')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusChip(item.status)}
              <Link href={API_ROUTES.downloadPayslip(item.id)} target="_blank">
                <Button intent="tertiary" size="sm">
                  <Icon name="document-text" size="xs" />
                </Button>
              </Link>
            </div>
          </div>
        </GridListItem>
      )}
    </GridList>
  );
}
