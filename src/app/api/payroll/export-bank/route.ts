import { NextResponse, type NextRequest } from 'next/server';
import { hrisApi } from '@/api/hris';
import { generateBankDisbursementCSV } from '@/api/hris/payroll/infrastructure/services/bank-export.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json({ error: 'Missing runId parameter' }, { status: 400 });
    }

    const run = await hrisApi.payroll.getPayrollRunById(runId);
    if (!run) {
      return NextResponse.json({ error: 'Payroll run not found' }, { status: 404 });
    }

    const csvContent = generateBankDisbursementCSV(run);
    const filename = `bank-disbursement-${run.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Failed to export bank CSV:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
