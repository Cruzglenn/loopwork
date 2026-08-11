import { NextResponse, type NextRequest } from 'next/server';
import { hrisApi } from '@/api/hris';
import {
  generateBankDisbursementCSV,
  generateBankDisbursementExcel,
  generateBankDisbursementPDF,
} from '@/api/hris/payroll/infrastructure/services/bank-export.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runId = searchParams.get('runId');
    const format = (searchParams.get('format') || 'xlsx').toLowerCase();

    if (!runId) {
      return NextResponse.json({ error: 'Missing runId parameter' }, { status: 400 });
    }

    const run = await hrisApi.payroll.getPayrollRunById(runId);
    if (!run) {
      return NextResponse.json({ error: 'Payroll run not found' }, { status: 404 });
    }

    const sanitizeName = run.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    if (format === 'pdf') {
      const pdfBuffer = await generateBankDisbursementPDF(run);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="bank-disbursement-${sanitizeName}.pdf"`,
        },
      });
    }

    if (format === 'csv') {
      const csvContent = generateBankDisbursementCSV(run);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="bank-disbursement-${sanitizeName}.csv"`,
        },
      });
    }

    // Default: Excel (.xls / .xlsx)
    const excelContent = generateBankDisbursementExcel(run);
    return new NextResponse(excelContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="bank-disbursement-${sanitizeName}.xls"`,
      },
    });
  } catch (error) {
    console.error('Failed to export bank file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
