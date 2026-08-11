import { type PayrollRunDto } from '../../model/dtos';

export function generateGLJournalEntriesCSV(run: PayrollRunDto): string {
  const headers = [
    'Journal ID',
    'Date',
    'Account Code',
    'Account Name',
    'Debit Amount',
    'Credit Amount',
    'Description',
  ];

  const journalId = `JE-PAY-${run.id.slice(-6).toUpperCase()}`;
  const dateStr = new Date(run.periodEnd).toISOString().split('T')[0];

  let totalGross = 0;
  let totalTax = 0;
  let totalHealth = 0;
  let totalPension = 0;
  let totalNet = 0;

  (run.payslips || []).forEach((slip) => {
    totalGross += slip.grossPay;
    totalNet += slip.netPay;

    (slip.items || []).forEach((item) => {
      if (item.name.includes('Tax')) {
        totalTax += item.amount;
      } else if (item.name.includes('Health')) {
        totalHealth += item.amount;
      } else if (item.name.includes('Social') || item.name.includes('Pension')) {
        totalPension += item.amount;
      }
    });
  });

  const rows = [
    // Debits (Expenses)
    [
      `"${journalId}"`,
      `"${dateStr}"`,
      '"6000"',
      '"Gross Salaries & Wage Expense"',
      totalGross.toFixed(2),
      '0.00',
      `"Payroll Expense for ${run.name}"`,
    ].join(','),
    [
      `"${journalId}"`,
      `"${dateStr}"`,
      '"6010"',
      '"Employer Tax & Contributions Expense"',
      (totalHealth + totalPension).toFixed(2),
      '0.00',
      `"Employer Contributions for ${run.name}"`,
    ].join(','),

    // Credits (Liabilities & Cash Outflow)
    [
      `"${journalId}"`,
      `"${dateStr}"`,
      '"2100"',
      '"Net Salaries Payable (Bank Treasury)"',
      '0.00',
      totalNet.toFixed(2),
      `"Net Salary Disbursement for ${run.name}"`,
    ].join(','),
    [
      `"${journalId}"`,
      `"${dateStr}"`,
      '"2200"',
      '"Withholding Tax Payable (BIR / Government)"',
      '0.00',
      totalTax.toFixed(2),
      `"Tax Withholding Liability for ${run.name}"`,
    ].join(','),
    [
      `"${journalId}"`,
      `"${dateStr}"`,
      '"2300"',
      '"Health & Social Security Protection Payable"',
      '0.00',
      (totalHealth * 2 + totalPension * 2).toFixed(2),
      `"Health & Pension Liability for ${run.name}"`,
    ].join(','),
  ];

  return [headers.join(','), ...rows].join('\n');
}
