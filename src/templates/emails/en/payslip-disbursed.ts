import { type EmailTemplate } from '..';
import { templateHtml } from '../utils';

export const payslipDisbursedTemplate = <EmailTemplate>{
  subject: 'Your Payslip for {{payPeriod}} is Ready',
  html: templateHtml({
    badge: {
      text: 'Disbursed',
      variant: 'success',
    },
    heading: 'Your Payslip has been Disbursed',
    subheading: 'Hi {{employeeName}}, your salary payout for {{payPeriod}} has been processed and paid.',
    details: [
      { label: 'Employee', value: '{{employeeName}}' },
      { label: 'Pay Period', value: '{{payPeriod}}' },
      { label: 'Gross Pay', value: '{{grossPay}}' },
      { label: 'Total Deductions', value: '{{totalDeductions}}' },
      { label: 'Net Payout', value: '{{netPay}}' },
      { label: 'Status', value: 'PAID' },
    ],
    content:
      '<p style="margin-top: 16px; margin-bottom: 0; font-size: 14px; color: #475569;">Your detailed payslip PDF is attached to this email for your financial records. You can also log in to your Loopwork Employee Portal anytime to view your complete payroll history.</p>',
  }),
};
