import { type EmailTemplate } from '../index';
import { templateHtml } from '../utils';

export const activateOrganizationAccount = <EmailTemplate>{
  subject: 'Activate your organization account',
  html: templateHtml({
    badge: {
      text: 'Account Activation',
      variant: 'info',
    },
    heading: 'Welcome to Loopwork',
    subheading: 'Hi {{firstName}} {{lastName}}, thank you for creating an account for "{{companyName}}".',
    content:
      '<p style="margin: 0 0 16px 0;">To activate your company account and get started, please confirm your email address below.</p>',
    cta: {
      label: 'Confirm Email Address',
      href: '{{activationLink}}',
    },
  }),
};

export const changePasswordTemplate = <EmailTemplate>{
  subject: 'Reset Password Request - Loopwork HRIS',
  html: templateHtml({
    badge: {
      text: 'Security',
      variant: 'warning',
    },
    heading: 'Password Reset Request',
    subheading: 'We received a request to reset the password for your Loopwork account.',
    content: `
      <p style="margin: 0 0 12px 0;">Click the button below to set a new password. If you didn't make this request, you can safely ignore this email — your password remains secure.</p>
    `,
    cta: {
      label: 'Reset Password',
      href: '{{changePasswordLink}}',
    },
  }),
};

export const inviteTemplate = <EmailTemplate>{
  subject: 'Welcome to Loopwork HRIS - Access Details',
  html: templateHtml({
    badge: {
      text: 'Welcome',
      variant: 'info',
    },
    heading: 'You have been invited to Loopwork',
    subheading:
      'An account has been created for you on Loopwork HRIS. Below are your initial login credentials:',
    details: [
      { label: 'Email', value: '{{email}}' },
      { label: 'Temporary Password', value: '{{tempPassword}}' },
    ],
    content:
      '<p style="margin: 16px 0 0 0; font-size: 13px; color: #64748b;">Please sign in using your temporary password and update it immediately upon logging in.</p>',
    cta: {
      label: 'Sign In to Loopwork',
      href: '{{appLink}}',
    },
  }),
};
