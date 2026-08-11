import PDFDocument from 'pdfkit';
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

export function generateGLJournalEntriesExcel(run: PayrollRunDto): string {
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

  const entries = [
    {
      code: '6000',
      name: 'Gross Salaries & Wage Expense',
      debit: totalGross,
      credit: 0,
      desc: `Payroll Expense for ${run.name}`,
    },
    {
      code: '6010',
      name: 'Employer Tax & Contributions Expense',
      debit: totalHealth + totalPension,
      credit: 0,
      desc: `Employer Contributions for ${run.name}`,
    },
    {
      code: '2100',
      name: 'Net Salaries Payable (Bank Treasury)',
      debit: 0,
      credit: totalNet,
      desc: `Net Salary Disbursement for ${run.name}`,
    },
    {
      code: '2200',
      name: 'Withholding Tax Payable (BIR / Government)',
      debit: 0,
      credit: totalTax,
      desc: `Tax Withholding Liability for ${run.name}`,
    },
    {
      code: '2300',
      name: 'Health & Social Security Protection Payable',
      debit: 0,
      credit: totalHealth * 2 + totalPension * 2,
      desc: `Health & Pension Liability for ${run.name}`,
    },
  ];

  const rows = entries
    .map(
      (e) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif;">${journalId}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif;">${dateStr}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: center; font-weight: bold;">${e.code}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; font-weight: bold;">${e.name}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: right; color: #2563eb;">₱${e.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: right; color: #dc2626;">₱${e.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; color: #475569;">${e.desc}</td>
    </tr>`,
    )
    .join('');

  return `
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <!--[if gte mso 9]>
    <xml>
     <x:ExcelWorkbook>
      <x:ExcelWorksheets>
       <x:ExcelWorksheet>
        <x:Name>General Ledger Journal</x:Name>
        <x:WorksheetOptions>
         <x:DisplayGridlines/>
        </x:WorksheetOptions>
       </x:ExcelWorksheet>
      </x:ExcelWorksheets>
     </x:ExcelWorkbook>
    </xml>
    <![endif]-->
  </head>
  <body>
    <h2 style="font-family: sans-serif; color: #0f172a;">General Ledger Accounting Journal Entries - ${run.name}</h2>
    <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #0f172a; color: #ffffff; font-family: sans-serif; font-weight: bold;">
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Journal ID</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Date</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Account Code</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Account Name</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Debit (₱)</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Credit (₱)</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Description</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
  </html>`;
}

export function generateGLJournalEntriesPDF(run: PayrollRunDto): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err: Error) => reject(err));

    // Title & Header
    doc.fontSize(18).fillColor('#0F172A').text('General Ledger Journal Voucher', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor('#475569').text(`Payroll Run: ${run.name}`, { align: 'center' });
    doc.moveDown(1);

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

    const entries = [
      { code: '6000', name: 'Gross Salaries & Wage Expense', debit: totalGross, credit: 0 },
      {
        code: '6010',
        name: 'Employer Tax & Contributions Expense',
        debit: totalHealth + totalPension,
        credit: 0,
      },
      { code: '2100', name: 'Net Salaries Payable (Bank Treasury)', debit: 0, credit: totalNet },
      { code: '2200', name: 'Withholding Tax Payable (BIR / Government)', debit: 0, credit: totalTax },
      {
        code: '2300',
        name: 'Health & Social Security Protection Payable',
        debit: 0,
        credit: totalHealth * 2 + totalPension * 2,
      },
    ];

    // Table Header
    const startY = doc.y;
    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0F172A');
    doc.text('Account Code', 40, startY, { width: 80 });
    doc.text('Account Name', 125, startY, { width: 220 });
    doc.text('Debit (₱)', 350, startY, { width: 90, align: 'right' });
    doc.text('Credit (₱)', 450, startY, { width: 90, align: 'right' });

    doc
      .moveTo(40, startY + 14)
      .lineTo(540, startY + 14)
      .strokeColor('#0F172A')
      .stroke();
    let currentY = startY + 20;

    entries.forEach((e) => {
      doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
      doc.text(e.code, 40, currentY, { width: 80 });
      doc.text(e.name, 125, currentY, { width: 220 });
      doc.text(
        e.debit > 0 ? `₱${e.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-',
        350,
        currentY,
        { width: 90, align: 'right' },
      );
      doc.text(
        e.credit > 0 ? `₱${e.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-',
        450,
        currentY,
        { width: 90, align: 'right' },
      );
      currentY += 20;
    });

    doc.moveTo(40, currentY).lineTo(540, currentY).strokeColor('#0F172A').stroke();
    currentY += 8;

    const totalDebit = totalGross + totalHealth + totalPension;
    const totalCredit = totalNet + totalTax + (totalHealth * 2 + totalPension * 2);

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#0F172A');
    doc.text('Total Balanced Entry', 40, currentY, { width: 305 });
    doc.text(`₱${totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 350, currentY, {
      width: 90,
      align: 'right',
    });
    doc.text(`₱${totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 450, currentY, {
      width: 90,
      align: 'right',
    });

    doc.end();
  });
}
