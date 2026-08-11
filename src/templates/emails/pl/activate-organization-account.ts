import { type EmailTemplate } from '../index';
import { templateHtml } from '../utils';

export const activateOrganizationAccount = <EmailTemplate>{
  subject: 'Aktywuj konto Twojej organizacji',
  html: templateHtml({
    badge: {
      text: 'Aktywacja Konta',
      variant: 'info',
    },
    heading: 'Witaj w Loopwork',
    subheading:
      'Cześć {{firstName}} {{lastName}}, dziękujemy za utworzenie konta dla firmy "{{companyName}}".',
    content:
      '<p style="margin: 0 0 16px 0;">Aby aktywować konto firmy i rozpocząć korzystanie z aplikacji, potwierdź swój adres e-mail poniżej.</p>',
    cta: {
      label: 'Potwierdź adres email',
      href: '{{activationLink}}',
    },
  }),
};

export const changePasswordTemplate = <EmailTemplate>{
  subject: 'Prośba o zmianę hasła do konta Loopwork',
  html: templateHtml({
    badge: {
      text: 'Bezpieczeństwo',
      variant: 'warning',
    },
    heading: 'Prośba o zmianę hasła',
    subheading: 'Otrzymaliśmy prośbę o zmianę hasła do Twojego konta w Loopwork.',
    content: `
      <p style="margin: 0 0 12px 0;">Kliknij poniższy przycisk, aby ustawić nowe hasło. Jeśli nie prosiłeś/aś o zmianę hasła, zignoruj tę wiadomość — Twoje obecne hasło pozostaje bezpieczne.</p>
    `,
    cta: {
      label: 'Zmień hasło',
      href: '{{changePasswordLink}}',
    },
  }),
};

export const inviteTemplate = <EmailTemplate>{
  subject: 'Witamy w Loopwork HRIS - Dane dostępowe',
  html: templateHtml({
    badge: {
      text: 'Zaproszenie',
      variant: 'info',
    },
    heading: 'Zostałeś/aś zaproszony/a do aplikacji Loopwork',
    subheading: 'Twoje konto w systemie Loopwork HRIS zostało utworzone. Oto Twoje dane logowania:',
    details: [
      { label: 'Email', value: '{{email}}' },
      { label: 'Tymczasowe hasło', value: '{{tempPassword}}' },
    ],
    content:
      '<p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">Zaloguj się przy użyciu tymczasowego hasła i zmień je niezwłocznie po zalogowaniu.</p>',
    cta: {
      label: 'Zaloguj się do Loopwork',
      href: '{{appLink}}',
    },
  }),
};
