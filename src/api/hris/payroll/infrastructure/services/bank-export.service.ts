import { type PayrollRunDto } from '../../model/dtos';

export function generateBankDisbursementCSV(run: PayrollRunDto): string {
  const headers = [
    'Payment Reference',
    'Employee ID',
    'Employee Name',
    'Net Salary Amount',
    'Currency',
    'Period Start',
    'Period End',
    'Payment Status',
  ];

  const rows = (run.payslips || []).map((slip, index) => {
    const ref = `PAY-${run.id.slice(-6).toUpperCase()}-${(index + 1).toString().padStart(3, '0')}`;
    const name = slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee';

    return [
      `"${ref}"`,
      `"${slip.employeeId}"`,
      `"${name.replace(/"/g, '""')}"`,
      slip.netPay.toFixed(2),
      '"PHP"',
      `"${new Date(slip.periodStart).toISOString().split('T')[0]}"`,
      `"${new Date(slip.periodEnd).toISOString().split('T')[0]}"`,
      `"${slip.status}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
