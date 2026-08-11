import { NextResponse, type NextRequest } from 'next/server';
import { hrisApi } from '@/api/hris';
import {
  generateGLJournalEntriesCSV,
  generateGLJournalEntriesExcel,
  generateGLJournalEntriesPDF,
} from '@/api/hris/payroll/infrastructure/services/gl-export.service';

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
      const pdfBuffer = await generateGLJournalEntriesPDF(run);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="gl-journal-${sanitizeName}.pdf"`,
        },
      });
    }

    if (format === 'csv') {
      const csvContent = generateGLJournalEntriesCSV(run);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="gl-journal-${sanitizeName}.csv"`,
        },
      });
    }

    // Default: Excel (.xls / .xlsx)
    const excelContent = generateGLJournalEntriesExcel(run);
    return new NextResponse(excelContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
        'Content-Disposition': `attachment; filename="gl-journal-${sanitizeName}.xls"`,
      },
    });
  } catch (error) {
    console.error('Failed to export GL file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
