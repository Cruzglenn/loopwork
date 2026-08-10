import * as nodemailer from 'nodemailer';
import { type Transporter } from 'nodemailer';
import { getEnv } from '@/shared/utils/get-env';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

export type EmailClient = Transporter<SMTPTransport.SentMessageInfo>;

export function nodemailerClient(): EmailClient {
  const host = getEnv('mailer_smtp_host', { required: true });
  const isSecure = getEnv('mailer_smtp_isSecure', { required: true }) === 'true';
  const port = parseInt(getEnv('mailer_smtp_port', { required: true }), 10);
  const user = getEnv('mailer_smtp_user', { required: true });
  const pass = getEnv('mailer_smtp_password', { required: true });

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
