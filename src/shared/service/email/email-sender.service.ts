import { type EmailClient } from '@/shared/service/email/nodemailer.client';
import { type EmailTemplateService } from '@/shared/service/templates/email-template.service';
import { getEnv } from '@/shared/utils/get-env';
import { type EmailTemplate } from '@/templates/emails';

export type SendEmailPayload = {
  to: string;
  html: {
    template: string;
    variables: { [key: string]: string | number };
  };
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
};
export type EmailSenderService = {
  sendEmail: (payload: SendEmailPayload) => Promise<void>;
};

export function emailSenderService(
  emailClient: EmailClient,
  templateService: EmailTemplateService,
): EmailSenderService {
  async function sendEmail(payload: SendEmailPayload): Promise<void> {
    const {
      to,
      html: { template, variables },
      attachments,
    } = payload;

    const { subject, html } = templateService<EmailTemplate>(template, variables);

    let from =
      process.env.mailer_email_from ||
      process.env.MAILER_EMAIL_FROM ||
      getEnv('mailer_email_from') ||
      'Loopwork HRIS <noreply@' + 'eurielleivy.site>';

    if (!from || from.includes('resend.dev') || from.includes('onboarding')) {
      from = 'Loopwork HRIS <noreply@' + 'eurielleivy.site>';
    }

    await emailClient.sendMail({
      from,
      to,
      subject,
      html,
      attachments,
    });
  }

  return {
    sendEmail,
  };
}
