import path from 'path';
import PDFDocument from 'pdfkit';
import { type PayslipDto } from '@/api/hris/payroll/model/dtos';
import { parseDate } from '@/shared';

const COLORS = {
  textDark: '#040760', // Loopwork Dark Navy
  textBody: '#242C32', // Loopwork Main Text
  textMuted: '#65798B', // Loopwork Muted Text
  textLight: '#94A3B8',
  primary: '#0A11EB', // Loopwork Signature Electric Blue
  primaryDark: '#060B93', // Loopwork Deep Accent
  primaryIce: '#78ABFB', // Loopwork Ice Blue
  success: '#8ABF33', // Loopwork Signature Green
  borderDark: '#0A11EB',
  borderLight: '#EAEDF0',
  tableBg: '#EEF2FF', // Loopwork Light Accent Tint
  bgIce: '#F0F5FF',
  bannerBlue: '#0A11EB',
  bannerGreen: '#8ABF33',
  bannerDark: '#060B93',
  bannerIce: '#78ABFB',
  bannerSoft: '#3B82F6',
};

const FONTS_DIR = path.join(process.cwd(), 'src/shared/assets/fonts');

const FONTS = {
  regular: 'Roboto-Regular',
  bold: 'Roboto-Bold',
  oblique: 'Roboto-Italic',
  boldOblique: 'Roboto-BoldItalic',
};

const PAGE = {
  marginLeft: 48,
  marginRight: 48,
  marginTop: 36,
  marginBottom: 36,
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

    doc.registerFont('Roboto-Regular', path.join(FONTS_DIR, 'Roboto-Regular.ttf'));
    doc.registerFont('Roboto-Bold', path.join(FONTS_DIR, 'Roboto-Bold.ttf'));
    doc.registerFont('Roboto-Italic', path.join(FONTS_DIR, 'Roboto-Italic.ttf'));
    doc.registerFont('Roboto-BoldItalic', path.join(FONTS_DIR, 'Roboto-BoldItalic.ttf'));

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', (err: Error) => reject(err));

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - PAGE.marginLeft - PAGE.marginRight;

    // 1. Top Loopwork Signature Accent Bar (5 colorful blocks using Loopwork brand palette)
    const blockWidth = pageWidth / 5;
    const bannerHeight = 6;

    doc.rect(0, 0, blockWidth, bannerHeight).fill(COLORS.bannerBlue);
    doc.rect(blockWidth, 0, blockWidth, bannerHeight).fill(COLORS.bannerGreen);
    doc.rect(blockWidth * 2, 0, blockWidth, bannerHeight).fill(COLORS.bannerDark);
    doc.rect(blockWidth * 3, 0, blockWidth, bannerHeight).fill(COLORS.bannerIce);
    doc.rect(blockWidth * 4, 0, blockWidth, bannerHeight).fill(COLORS.bannerSoft);

    // 2. Header Section
    let currentY = PAGE.marginTop + 14;

    // Loopwork Logo / Company Brand Title
    doc
      .font(FONTS.bold)
      .fontSize(24)
      .fillColor(COLORS.primary)
      .text(
        companyName.toLowerCase().endsWith('.') ? companyName.toLowerCase() : `${companyName.toLowerCase()}.`,
        PAGE.marginLeft,
        currentY,
      );

    // Header Right: Subtle Light Gray "PAYSLIP" Title
    doc
      .font(FONTS.bold)
      .fontSize(22)
      .fillColor('#CBD5E1')
      .text('PAYSLIP', PAGE.marginLeft + contentWidth - 200, currentY, { width: 200, align: 'right' });

    currentY += 34;

    const metaX = PAGE.marginLeft + contentWidth - 220;
    doc.font(FONTS.regular).fontSize(9).fillColor(COLORS.textMuted);

    // Document Details Table
    doc.text('Document', metaX, currentY);
    doc
      .font(FONTS.bold)
      .fillColor(COLORS.primaryDark)
      .text(`PAY-${payslip.id.slice(-8).toUpperCase()}`, metaX + 80, currentY, {
        width: 140,
        align: 'right',
      });

    currentY += 14;
    doc.font(FONTS.regular).fillColor(COLORS.textMuted).text('Issue Date', metaX, currentY);
    doc
      .font(FONTS.regular)
      .fillColor(COLORS.textBody)
      .text(parseDate(payslip.createdAt, 'MMMM D, YYYY'), metaX + 80, currentY, {
        width: 140,
        align: 'right',
      });

    currentY += 14;
    doc.font(FONTS.regular).fillColor(COLORS.textMuted).text('Pay Period', metaX, currentY);
    doc
      .font(FONTS.regular)
      .fillColor(COLORS.textBody)
      .text(
        `${parseDate(payslip.periodStart, 'MMM D')} - ${parseDate(payslip.periodEnd, 'MMM D, YYYY')}`,
        metaX + 80,
        currentY,
        { width: 140, align: 'right' },
      );

    currentY += 28;

    // 3. Bill From / Bill To / Total Summary Block
    const colWidth = (contentWidth - 40) / 3;

    // Col 1: PAID TO (Employee)
    const col1X = PAGE.marginLeft;
    doc.font(FONTS.bold).fontSize(8).fillColor(COLORS.textMuted).text('PAID TO:', col1X, currentY);
    doc
      .font(FONTS.bold)
      .fontSize(10.5)
      .fillColor(COLORS.textDark)
      .text(
        sanitizeText(`${payslip.employee?.firstName || ''} ${payslip.employee?.lastName || ''}`),
        col1X,
        currentY + 12,
      );
    doc
      .font(FONTS.regular)
      .fontSize(8.5)
      .fillColor(COLORS.textBody)
      .text(sanitizeText(payslip.employee?.role || 'Employee'), col1X, currentY + 26)
      .text(`ID: ${payslip.employeeId}`, col1X, currentY + 37);

    // Col 2: PAID BY (Company)
    const col2X = PAGE.marginLeft + colWidth + 20;
    doc.font(FONTS.bold).fontSize(8).fillColor(COLORS.textMuted).text('PAID BY:', col2X, currentY);
    doc
      .font(FONTS.bold)
      .fontSize(10.5)
      .fillColor(COLORS.textDark)
      .text(sanitizeText(companyName), col2X, currentY + 12);
    doc
      .font(FONTS.regular)
      .fontSize(8.5)
      .fillColor(COLORS.textBody)
      .text('Payroll & HR Department', col2X, currentY + 26)
      .text('Status: APPROVED', col2X, currentY + 37);

    // Col 3: TOTAL (Net Take-Home Pay)
    const col3X = PAGE.marginLeft + colWidth * 2 + 40;
    doc
      .font(FONTS.bold)
      .fontSize(8)
      .fillColor(COLORS.textMuted)
      .text('NET TAKE-HOME', col3X, currentY, { width: colWidth, align: 'right' });
    doc
      .font(FONTS.bold)
      .fontSize(17)
      .fillColor(COLORS.primary)
      .text(
        `₱${payslip.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        col3X,
        currentY + 14,
        { width: colWidth, align: 'right' },
      );

    currentY += 58;

    // Divider Line with Loopwork Brand Accent
    doc
      .moveTo(PAGE.marginLeft, currentY)
      .lineTo(PAGE.marginLeft + contentWidth, currentY)
      .strokeColor(COLORS.borderLight)
      .lineWidth(0.75)
      .stroke();

    currentY += 16;

    // 4. Contract & Scope Section
    doc
      .font(FONTS.bold)
      .fontSize(11)
      .fillColor(COLORS.primaryDark)
      .text('Employment & Salary Statement', PAGE.marginLeft, currentY);

    currentY += 15;
    doc.font(FONTS.bold).fontSize(8.5).fillColor(COLORS.textDark).text('Scope', PAGE.marginLeft, currentY);
    currentY += 11;
    doc
      .font(FONTS.regular)
      .fontSize(8.5)
      .fillColor(COLORS.textBody)
      .text(
        `Compensation for work performed from ${parseDate(payslip.periodStart, 'MMMM D, YYYY')} to ${parseDate(payslip.periodEnd, 'MMMM D, YYYY')}.`,
        PAGE.marginLeft,
        currentY,
      );

    currentY += 14;
    doc
      .font(FONTS.bold)
      .fontSize(8.5)
      .fillColor(COLORS.textDark)
      .text('Approved by:', PAGE.marginLeft, currentY);
    currentY += 11;
    doc
      .font(FONTS.regular)
      .fontSize(8.5)
      .fillColor(COLORS.textBody)
      .text(`HR Administrator on ${parseDate(payslip.createdAt, 'MMMM D, YYYY')}`, PAGE.marginLeft, currentY);

    currentY += 24;

    // 5. Itemized Breakdown Table
    const tableHeaderY = currentY;
    const tableHeaderHeight = 24;

    // Loopwork Light Accent Table Header Background
    doc.rect(PAGE.marginLeft, tableHeaderY, contentWidth, tableHeaderHeight).fill(COLORS.tableBg);

    // Table Header Top Accent Line in Loopwork Primary Blue
    doc
      .moveTo(PAGE.marginLeft, tableHeaderY)
      .lineTo(PAGE.marginLeft + contentWidth, tableHeaderY)
      .strokeColor(COLORS.primary)
      .lineWidth(1.5)
      .stroke();

    // Table Header Text
    doc
      .font(FONTS.bold)
      .fontSize(9)
      .fillColor(COLORS.primaryDark)
      .text('Description', PAGE.marginLeft + 12, tableHeaderY + 7)
      .text('Amount', PAGE.marginLeft + contentWidth - 120, tableHeaderY + 7, {
        width: 108,
        align: 'right',
      });

    currentY += tableHeaderHeight + 12;

    // Section Subtitle
    doc
      .font(FONTS.bold)
      .fontSize(9.5)
      .fillColor(COLORS.textDark)
      .text('Standard Payroll Compensation', PAGE.marginLeft + 12, currentY);
    currentY += 12;

    doc
      .font(FONTS.oblique)
      .fontSize(8)
      .fillColor(COLORS.textMuted)
      .text(
        `Statement for work between ${parseDate(payslip.periodStart, 'MMMM D, YYYY')} to ${parseDate(payslip.periodEnd, 'MMMM D, YYYY')}`,
        PAGE.marginLeft + 12,
        currentY,
      );
    currentY += 16;

    // Divider after subtitle
    doc
      .moveTo(PAGE.marginLeft + 12, currentY)
      .lineTo(PAGE.marginLeft + contentWidth - 12, currentY)
      .strokeColor(COLORS.borderLight)
      .lineWidth(0.5)
      .stroke();
    currentY += 8;

    // Basic Pay Line Item
    doc
      .font(FONTS.regular)
      .fontSize(9)
      .fillColor(COLORS.textBody)
      .text('Basic Salary', PAGE.marginLeft + 12, currentY);
    doc.text(
      `₱${payslip.basicPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      PAGE.marginLeft + contentWidth - 120,
      currentY,
      { width: 108, align: 'right' },
    );
    currentY += 18;

    // Overtime Line Item (if any)
    if (payslip.overtimePay > 0) {
      doc
        .font(FONTS.regular)
        .fontSize(9)
        .fillColor(COLORS.textBody)
        .text('Overtime Pay', PAGE.marginLeft + 12, currentY);
      doc.text(
        `₱${payslip.overtimePay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        PAGE.marginLeft + contentWidth - 120,
        currentY,
        { width: 108, align: 'right' },
      );
      currentY += 18;
    }

    // Additional Allowances & Deductions items
    if (payslip.items && payslip.items.length > 0) {
      payslip.items.forEach((item) => {
        const isAllowance = item.type === 'ALLOWANCE';

        doc
          .font(FONTS.regular)
          .fontSize(9)
          .fillColor(COLORS.textBody)
          .text(sanitizeText(item.name), PAGE.marginLeft + 12, currentY);
        doc
          .fillColor(isAllowance ? COLORS.textBody : '#DC2626')
          .text(
            `₱${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            PAGE.marginLeft + contentWidth - 120,
            currentY,
            {
              width: 108,
              align: 'right',
            },
          );
        currentY += 18;
      });
    }

    currentY += 6;

    // Table Summary Rows
    doc
      .moveTo(PAGE.marginLeft + 12, currentY)
      .lineTo(PAGE.marginLeft + contentWidth - 12, currentY)
      .strokeColor(COLORS.borderLight)
      .lineWidth(0.5)
      .stroke();
    currentY += 8;

    // Subtotal (Gross Pay)
    doc
      .font(FONTS.regular)
      .fontSize(9)
      .fillColor(COLORS.textMuted)
      .text('Subtotal (Gross Pay)', PAGE.marginLeft + 12, currentY);
    doc
      .font(FONTS.bold)
      .fillColor(COLORS.textDark)
      .text(
        `₱${payslip.grossPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        PAGE.marginLeft + contentWidth - 120,
        currentY,
        { width: 108, align: 'right' },
      );
    currentY += 16;

    // Deductions
    doc
      .font(FONTS.regular)
      .fontSize(9)
      .fillColor(COLORS.textMuted)
      .text('Total Deductions', PAGE.marginLeft + 12, currentY);
    doc
      .font(FONTS.bold)
      .fillColor('#DC2626')
      .text(
        `₱${payslip.deductionsTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        PAGE.marginLeft + contentWidth - 120,
        currentY,
        { width: 108, align: 'right' },
      );
    currentY += 18;

    // Total Row with Top and Bottom Dark Accent Lines
    const totalRowY = currentY;
    doc
      .moveTo(PAGE.marginLeft, totalRowY)
      .lineTo(PAGE.marginLeft + contentWidth, totalRowY)
      .strokeColor(COLORS.primary)
      .lineWidth(1.5)
      .stroke();

    currentY += 8;
    doc
      .font(FONTS.bold)
      .fontSize(10)
      .fillColor(COLORS.primaryDark)
      .text('Total (Net Pay)', PAGE.marginLeft + 12, currentY);
    doc
      .font(FONTS.bold)
      .fontSize(11)
      .fillColor(COLORS.primary)
      .text(
        `₱${payslip.netPay.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        PAGE.marginLeft + contentWidth - 120,
        currentY,
        { width: 108, align: 'right' },
      );

    currentY += 16;
    doc
      .moveTo(PAGE.marginLeft, currentY)
      .lineTo(PAGE.marginLeft + contentWidth, currentY)
      .strokeColor(COLORS.primary)
      .lineWidth(1.5)
      .stroke();

    // 7. Page Footer
    const footerY = pageHeight - PAGE.marginBottom;
    doc
      .font(FONTS.regular)
      .fontSize(7.5)
      .fillColor(COLORS.textLight)
      .text(`Loopwork Ref: ${payslip.id}`, PAGE.marginLeft, footerY)
      .text('Page 1/1', PAGE.marginLeft + contentWidth - 60, footerY, { width: 60, align: 'right' });

    doc.end();
  });
}
