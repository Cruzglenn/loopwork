import { type NextRequest } from 'next/server';
import { hrisApi } from '@/api/hris';
import { buildPayslipPdf } from '@/shared/service/file-persistance/payslip-pdf-builder';
import { encodeFilenameForHeader } from '@/shared';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slipId = searchParams.get('id');

  if (!slipId) {
    return Response.json({ error: 'Missing payslip id' }, { status: 400 });
  }

  const payslip = await hrisApi.payroll.getPayslipById(slipId);
  if (!payslip) {
    return Response.json({ error: 'Payslip not found' }, { status: 404 });
  }

  const companyName = (await hrisApi.company.getDefaultCompanyName()) || 'Loopwork Inc.';

  const pdfBuffer = await buildPayslipPdf(payslip, companyName);
  const filename = `Payslip_${payslip.employee?.firstName}_${payslip.employee?.lastName}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': encodeFilenameForHeader(filename),
    },
  });
}
