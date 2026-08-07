import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { hrisApi } from '@/api/hris';
import { Card, Table, TableHeader, TableBody, Row, Cell, Chip, Button, Icon, NoResults } from '@/lib/ui';
import { parseDate, type Columns, API_ROUTES } from '@/shared';
import { SalaryConfigCard } from './_components/salary-config-card';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const PAYSLIP_COLUMNS: Columns = {
  period: { label: 'payroll.table.period' },
  grossPay: { label: 'payroll.table.grossPay' },
  deductions: { label: 'payroll.table.deductions' },
  netPay: { label: 'payroll.table.netPay' },
  status: { label: 'payroll.table.status' },
  actions: { label: 'payroll.table.actions' },
};

export default async function EmployeePayrollPage({ params }: Props) {
  const { id: employeeId } = await params;
  const t = await getTranslations();

  const [salaryConfig, payslips] = await Promise.all([
    hrisApi.payroll.getSalaryConfig(employeeId),
    hrisApi.payroll.getEmployeePayslips(employeeId),
  ]);

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
    <div className="flex flex-col gap-6">
      <SalaryConfigCard config={salaryConfig} employeeId={employeeId} />

      <Card className="flex flex-col gap-4 p-6">
        <h3 className="text-lg font-semibold">{t('payroll.title')}</h3>

        {payslips.length === 0 ? (
          <NoResults />
        ) : (
          <Table aria-label={t('payroll.title')}>
            <TableHeader columns={PAYSLIP_COLUMNS} />
            <TableBody>
              {payslips.map((item) => (
                <Row key={item.id} id={item.id}>
                  <Cell>
                    {parseDate(item.periodStart, 'MMM DD')} - {parseDate(item.periodEnd, 'MMM DD, YYYY')}
                  </Cell>
                  <Cell>₱{item.grossPay.toLocaleString()}</Cell>
                  <Cell className="text-red-600">-₱{item.deductionsTotal.toLocaleString()}</Cell>
                  <Cell className="font-bold text-blue-600">₱{item.netPay.toLocaleString()}</Cell>
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
        )}
      </Card>
    </div>
  );
}
