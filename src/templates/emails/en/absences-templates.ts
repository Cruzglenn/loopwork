import { type EmailTemplate } from '..';
import { templateHtml } from '../utils';

export const approveAbsenceTemplate = <EmailTemplate>{
  subject: 'Your absence request has been approved',
  html: templateHtml({
    badge: {
      text: 'Approved',
      variant: 'success',
    },
    heading: 'Absence Request Approved',
    subheading: 'Hi {{firstName}}, your absence request has been reviewed and approved.',
    details: [
      { label: 'Employee', value: '{{firstName}}' },
      { label: 'Start Date', value: '{{startDate}}' },
      { label: 'End Date', value: '{{endDate}}' },
      { label: 'Duration', value: '{{days}} day(s)' },
      { label: 'Status', value: 'Approved' },
    ],
  }),
};

export const rejectAbsenceTemplate = <EmailTemplate>{
  subject: 'Your absence request has been rejected',
  html: templateHtml({
    badge: {
      text: 'Rejected',
      variant: 'danger',
    },
    heading: 'Absence Request Rejected',
    subheading: 'Hi {{firstName}}, your absence request has been reviewed and was not approved.',
    details: [
      { label: 'Employee', value: '{{firstName}}' },
      { label: 'Start Date', value: '{{startDate}}' },
      { label: 'End Date', value: '{{endDate}}' },
      { label: 'Duration', value: '{{days}} day(s)' },
      { label: 'Status', value: 'Rejected' },
    ],
  }),
};
