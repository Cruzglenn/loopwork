import { type EmailTemplate } from '../index';
import { templateHtml } from '../utils';

export const activateOrganizationAccount = <EmailTemplate>{
  subject: 'Activate your organization account',
  html: templateHtml(
    'Hi {{firstName}} {{lastName}}!',
    `Thank you for creating an account with us for you company "{{companyName}}". To activate your account, please click on the link below.`,
    {
      label: 'Confirm email',
      href: '{{activationLink}}',
    },
  ),
};

export const changePasswordTemplate = <EmailTemplate>{
  subject: 'Change Password Request for your Loopwork account',
  html: templateHtml(
    'Change Password Request',
    `
      <p style="margin: 0 0 16px 0;">We received a request to reset the password for your <strong>Loopwork</strong> account.</p>
      <ol style="margin: 0 0 16px 0; padding-left: 20px; color: #475569;">
        <li style="margin-bottom: 8px;">Click the button below to set a new password for your account.</li>
        <li>If you did not request a password change, please disregard this email. Your password remains secure and no changes were made.</li>
      </ol>
  `,
    { label: 'Change password', href: '{{changePasswordLink}}' },
  ),
};

export const inviteTemplate = <EmailTemplate>{
  subject: 'Welcome to Loopwork - Your Access Details',
  html: templateHtml(
    'You have been invited to Loopwork application',
    `
      <p>You have been invited to Loopwork application</p>
      <p>Login Details:</p>
      <p>Email: {{email}}</p>
      <p>Temporary Password: {{tempPassword}}</p>
    `,
  ),
};
