import * as nodemailer from 'nodemailer';
import { type Transporter } from 'nodemailer';
import { getEnv } from '@/shared/utils/get-env';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type EmailClient = Transporter<SMTPTransport.SentMessageInfo>;

export function nodemailerClient(): EmailClient {
  const host =
    process.env.mailer_smtp_host ||
    process.env.MAILER_SMTP_HOST ||
    getEnv('mailer_smtp_host') ||
    'smtp.resend.com';
  const isSecure =
    (process.env.mailer_smtp_isSecure ||
      process.env.MAILER_SMTP_ISSECURE ||
      getEnv('mailer_smtp_isSecure') ||
      'true') === 'true';
  const port = parseInt(
    process.env.mailer_smtp_port || process.env.MAILER_SMTP_PORT || getEnv('mailer_smtp_port') || '465',
    10,
  );
  const user =
    process.env.mailer_smtp_user || process.env.MAILER_SMTP_USER || getEnv('mailer_smtp_user') || 'resend';
  const pass =
    process.env.mailer_smtp_password ||
    process.env.MAILER_SMTP_PASSWORD ||
    getEnv('mailer_smtp_password') ||
    '';

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });
}
