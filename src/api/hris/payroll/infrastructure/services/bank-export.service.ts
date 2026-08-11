import PDFDocument from 'pdfkit';
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

export function generateBankDisbursementExcel(run: PayrollRunDto): string {
  const rows = (run.payslips || [])
    .map((slip, index) => {
      const ref = `PAY-${run.id.slice(-6).toUpperCase()}-${(index + 1).toString().padStart(3, '0')}`;
      const name = slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee';
      const startDate = new Date(slip.periodStart).toISOString().split('T')[0];
      const endDate = new Date(slip.periodEnd).toISOString().split('T')[0];

      return `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif;">${ref}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif;">${slip.employeeId}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; font-weight: bold;">${name}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: right; font-weight: bold; color: #047857;">₱${slip.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: center;">PHP</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: center;">${startDate}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: center;">${endDate}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: sans-serif; text-align: center; font-weight: bold;">${slip.status}</td>
      </tr>`;
    })
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
        <x:Name>Bank Payment Advice</x:Name>
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
    <h2 style="font-family: sans-serif; color: #0f172a;">Bank Disbursement Advice - ${run.name}</h2>
    <p style="font-family: sans-serif; color: #475569;">Total Commitment: <strong>₱${run.totalNet.toLocaleString()}</strong> | Status: <strong>${run.status}</strong></p>
    <table border="1" cellpadding="0" cellspacing="0" style="border-collapse: collapse; width: 100%;">
      <thead>
        <tr style="background-color: #1e3a8a; color: #ffffff; font-family: sans-serif; font-weight: bold;">
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Payment Ref</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Employee ID</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Employee Name</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Net Payout</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Currency</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Period Start</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Period End</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </body>
  </html>`;
}

export function generateBankDisbursementPDF(run: PayrollRunDto): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err: Error) => reject(err));

    // Title & Header
    doc.fontSize(20).fillColor('#0F172A').text('Bank Disbursement Advice', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(12).fillColor('#475569').text(`Payroll Batch: ${run.name}`, { align: 'center' });
    doc.moveDown(0.5);

    // Summary Card
    doc.fontSize(10).fillColor('#1E293B');
    doc.text(`Total Payout: ₱${run.totalNet.toLocaleString()}`);
    doc.text(`Total Employees: ${run.totalPayslips}`);
    doc.text(`Batch Status: ${run.status}`);
    doc.moveDown(1);

    // Table Headers
    const startY = doc.y;
    doc.fontSize(9).fillColor('#1E3A8A');
    doc.text('Ref', 40, startY, { width: 90 });
    doc.text('Employee', 135, startY, { width: 180 });
    doc.text('Net Pay', 320, startY, { width: 100, align: 'right' });
    doc.text('Status', 430, startY, { width: 120, align: 'right' });

    doc
      .moveTo(40, startY + 14)
      .lineTo(550, startY + 14)
      .strokeColor('#CBD5E1')
      .stroke();
    let currentY = startY + 20;

    (run.payslips || []).forEach((slip, index) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 40;
      }
      const ref = `PAY-${run.id.slice(-6).toUpperCase()}-${(index + 1).toString().padStart(3, '0')}`;
      const name = slip.employee ? `${slip.employee.firstName} ${slip.employee.lastName}` : 'Employee';

      doc.fontSize(8.5).fillColor('#334155');
      doc.text(ref, 40, currentY, { width: 90 });
      doc.text(name, 135, currentY, { width: 180 });
      doc
        .font('Helvetica-Bold')
        .fillColor('#047857')
        .text(`₱${slip.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 320, currentY, {
          width: 100,
          align: 'right',
        });
      doc
        .font('Helvetica')
        .fillColor('#475569')
        .text(slip.status, 430, currentY, { width: 120, align: 'right' });

      currentY += 18;
    });

    doc.end();
  });
}
