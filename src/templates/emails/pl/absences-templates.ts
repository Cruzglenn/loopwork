import { type EmailTemplate } from '..';
import { templateHtml } from '../utils';

export const approveAbsenceTemplate = <EmailTemplate>{
  subject: 'Twoja prośba o nieobecność została zatwierdzona',
  html: templateHtml({
    badge: {
      text: 'Zatwierdzone',
      variant: 'success',
    },
    heading: 'Prośba o nieobecność zatwierdzona',
    subheading: 'Cześć {{firstName}}, Twoja prośba o nieobecność została rozpatrzona i zatwierdzona.',
    details: [
      { label: 'Pracownik', value: '{{firstName}}' },
      { label: 'Data rozpoczęcia', value: '{{startDate}}' },
      { label: 'Data zakończenia', value: '{{endDate}}' },
      { label: 'Czas trwania', value: '{{days}} dni' },
      { label: 'Status', value: 'Zatwierdzone' },
    ],
  }),
};

export const rejectAbsenceTemplate = <EmailTemplate>{
  subject: 'Twoja prośba o nieobecność została odrzucona',
  html: templateHtml({
    badge: {
      text: 'Odrzucone',
      variant: 'danger',
    },
    heading: 'Prośba o nieobecność odrzucona',
    subheading: 'Cześć {{firstName}}, Twoja prośba o nieobecność została rozpatrzona i odrzucona.',
    details: [
      { label: 'Pracownik', value: '{{firstName}}' },
      { label: 'Data rozpoczęcia', value: '{{startDate}}' },
      { label: 'Data zakończenia', value: '{{endDate}}' },
      { label: 'Czas trwania', value: '{{days}} dni' },
      { label: 'Status', value: 'Odrzucone' },
    ],
  }),
};
