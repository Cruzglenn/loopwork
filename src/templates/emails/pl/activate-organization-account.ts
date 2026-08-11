import { type EmailTemplate } from '../index';
import { templateHtml } from '../utils';

export const activateOrganizationAccount = <EmailTemplate>{
  subject: 'Aktywuj konto Twojej organizacji',
  html: templateHtml(
    'Witaj {{firstName}} {{lastName}}!',
    `Dziękujemy za utworzenie konta dla Twojej firmy "{{companyName}}". Aby aktywować konto, kliknij w poniższy link.`,
    {
      label: 'Potwierdź email',
      href: '{{activationLink}}',
    },
  ),
};

export const changePasswordTemplate = <EmailTemplate>{
  subject: 'Prośba o zmianę hasła do Twojego konta Loopwork',
  html: templateHtml(
    'Prośba o zmianę hasła',
    `
      <p style="margin: 0 0 16px 0;">Otrzymaliśmy prośbę o zmianę hasła do Twojego konta w <strong>Loopwork</strong>.</p>
      <ol style="margin: 0 0 16px 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">Kliknij poniższy przycisk, aby ustawić nowe hasło.</li>
        <li>Jeśli nie prosiłeś/aś o zmianę hasła, zignoruj tę wiadomość. Twoje obecne hasło pozostaje bezpieczne.</li>
      </ol>
  `,
    { label: 'Zmień hasło', href: '{{changePasswordLink}}' },
  ),
};

export const inviteTemplate = <EmailTemplate>{
  subject: 'Witamy w aplikacji Loopwork - Twoje dane dostępowe',
  html: templateHtml(
    'Zostałeś/aś zaproszony/a do aplikacji Loopwork',
    `
      <p>Zostałeś/aś zaproszony/a do aplikacji Loopwork</p>
      <p>Dane logowania:</p>
      <p>Aplikacja: {{appLink}}</p>
      <p>Email: {{email}}</p>
      <p>Tymczasowe hasło: {{tempPassword}}</p>
    `,
  ),
};
