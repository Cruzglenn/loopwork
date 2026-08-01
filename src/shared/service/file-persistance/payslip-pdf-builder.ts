import PDFDocument from 'pdfkit';
import { type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { parseDate } from '@/shared';

const COLORS = {
  black: '#000000' as const,
  text: '#242C32' as const,
  muted: '#516170' as const,
  primary: '#0A11EB' as const,
  line: '#E2E8F0' as const,
  bgLight: '#F8FAFC' as const,
};

const FONTS = {
  regular: 'Helvetica',
  bold: 'Helvetica-Bold',
};

const PAGE = {
  marginLeft: 56,
  marginRight: 56,
  marginTop: 40,
  marginBottom: 40,
};

function sanitizeText(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '').replace(/–/g, '-').replace(/—/g, '-');
}

export function buildPayslipPdf(payslip: PayslipDto, companyName = 'Loopwork Inc.'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Payslip - ${payslip.employee?.firstName} ${payslip.employee?.lastName}`,
        Author: companyName,
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err: Error) => reject(err));

    const contentWidth = doc.page.width - PAGE.marginLeft - PAGE.marginRight;

    // Header
    doc
      .font(FONTS.bold)
      .fontSize(22)
      .fillColor(COLORS.primary)
      .text(companyName, PAGE.marginLeft, PAGE.marginTop);

    doc
      .font(FONTS.bold)
      .fontSize(14)
      .fillColor(COLORS.text)
      .text('PAYSLIP / STATEMENT OF EARNINGS', PAGE.marginLeft, doc.y + 4);

    doc
      .moveTo(PAGE.marginLeft, doc.y + 10)
      .lineTo(PAGE.marginLeft + contentWidth, doc.y + 10)
      .strokeColor(COLORS.line)
      .lineWidth(1)
      .stroke();

    const infoY = doc.y + 20;

    // Employee & Period Details
    doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.text).text('EMPLOYEE DETAILS', PAGE.marginLeft, infoY);

    doc
      .font(FONTS.regular)
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(
        sanitizeText(`Name: ${payslip.employee?.firstName || ''} ${payslip.employee?.lastName || ''}`),
        PAGE.marginLeft,
        doc.y + 4,
      )
      .text(sanitizeText(`Role: ${payslip.employee?.role || 'Employee'}`), PAGE.marginLeft, doc.y + 2);

    const rightColX = PAGE.marginLeft + contentWidth / 2;

    doc.font(FONTS.bold).fontSize(10).fillColor(COLORS.text).text('PAY PERIOD DETAILS', rightColX, infoY);

    doc
      .font(FONTS.regular)
      .fontSize(9)
      .fillColor(COLORS.muted)
      .text(
        `Period: ${parseDate(payslip.periodStart, 'MMM DD, YYYY')} - ${parseDate(payslip.periodEnd, 'MMM DD, YYYY')}`,
        rightColX,
        doc.y + 4,
      )
      .text(`Issued Date: ${parseDate(payslip.createdAt, 'MMM DD, YYYY')}`, rightColX, doc.y + 2)
      .text(`Status: ${payslip.status}`, rightColX, doc.y + 2);

    const tableY = doc.y + 30;

    // Line Items Table Header
    doc.rect(PAGE.marginLeft, tableY, contentWidth, 24).fill(COLORS.bgLight);

    doc
      .font(FONTS.bold)
      .fontSize(9)
      .fillColor(COLORS.text)
      .text('DESCRIPTION', PAGE.marginLeft + 10, tableY + 7)
      .text('TYPE', PAGE.marginLeft + 280, tableY + 7)
      .text('AMOUNT', PAGE.marginLeft + contentWidth - 80, tableY + 7, { align: 'right' });

    let currentY = tableY + 28;

    // Line Items
    if (payslip.items && payslip.items.length > 0) {
      payslip.items.forEach((item) => {
        const isAllowance = item.type === 'ALLOWANCE';
        const formattedAmount = `$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

        doc
          .font(FONTS.regular)
          .fontSize(9)
          .fillColor(COLORS.text)
          .text(sanitizeText(item.name), PAGE.marginLeft + 10, currentY)
          .fillColor(isAllowance ? '#166534' : '#991B1B')
          .text(item.type, PAGE.marginLeft + 280, currentY)
          .fillColor(COLORS.text)
          .text(formattedAmount, PAGE.marginLeft + contentWidth - 80, currentY, { align: 'right' });

        currentY += 20;

        doc
          .moveTo(PAGE.marginLeft, currentY - 4)
          .lineTo(PAGE.marginLeft + contentWidth, currentY - 4)
          .strokeColor('#F1F5F9')
          .lineWidth(1)
          .stroke();
      });
    }

    currentY += 10;

    // Totals Card Box
    doc.rect(PAGE.marginLeft, currentY, contentWidth, 70).fill(COLORS.bgLight);

    const totalsY = currentY + 12;

    doc
      .font(FONTS.regular)
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text('Gross Pay:', PAGE.marginLeft + 16, totalsY)
      .font(FONTS.bold)
      .fillColor(COLORS.text)
      .text(
        `$${payslip.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        PAGE.marginLeft + 100,
        totalsY,
      );

    doc
      .font(FONTS.regular)
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text('Total Deductions:', PAGE.marginLeft + 16, totalsY + 18)
      .font(FONTS.bold)
      .fillColor('#991B1B')
      .text(
        `-$${payslip.deductionsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        PAGE.marginLeft + 100,
        totalsY + 18,
      );

    doc
      .font(FONTS.bold)
      .fontSize(12)
      .fillColor(COLORS.primary)
      .text('NET TAKE-HOME PAY:', rightColX, totalsY + 8)
      .fontSize(16)
      .text(
        `$${payslip.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        rightColX,
        totalsY + 24,
      );

    doc.end();
  });
}
