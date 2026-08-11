import { headers } from 'next/headers';
import {
  type ChangePasswordMessageSender,
  type ChangePasswordPayload,
} from '@/api/hris/authentication/model/repository/change-password-message-sender';
import { AUTH_ROUTES } from '@/shared';
import { getEnv } from '@/shared/utils/get-env';
import { notificationsServiceFactory } from '@/shared/service/email/notifications-service.factory';

export function sendChangePasswordTokenService(): ChangePasswordMessageSender {
  return {
    async sendChangePasswordRequestToken(payload: ChangePasswordPayload): Promise<void> {
      let baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || getEnv('NEXT_PUBLIC_APP_URL') || 'https://www.eurielleivy.site';

      try {
        const reqHeaders = await headers();
        const hostHeader = reqHeaders.get('x-forwarded-host') || reqHeaders.get('host');
        const proto = reqHeaders.get('x-forwarded-proto') || 'https';
        if (hostHeader) {
          baseUrl = `${proto}://${hostHeader}`;
        }
      } catch {
        // Fallback to configured baseUrl
      }

      if (baseUrl.includes('vercel.app')) {
        baseUrl = 'https://www.eurielleivy.site';
      }

      const appUrl = baseUrl.replace(/\/+$/, '');
      const changePasswordLink = `${appUrl}${AUTH_ROUTES.resetPassword(payload.token)}`;

      const notificationsService = await notificationsServiceFactory();
      await notificationsService.sendNotification({
        notificationsServiceSettings: {
          channels: ['EMAIL'],
          severity: 'HIGH',
          recipientEmail: payload.email,
          templateKey: 'auth.reset-password',
          templateVariables: {
            changePasswordLink,
          },
        },
        emailSenderPayload: {
          to: payload.email,
          html: {
            template: 'changePasswordTemplate',
            variables: {
              changePasswordLink,
            },
          },
        },
      });
    },
  };
}
