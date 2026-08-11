import dayjs from 'dayjs';
import { type ChangePasswordRepository } from '@/api/hris/authentication/model/repository';
import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';

export function changePasswordRepository(db: OrganizationPrismaClient): ChangePasswordRepository {
  const createChangePasswordRequest = async (email: string, token: string) => {
    await db.changePasswordRequest.create({
      data: {
        email,
        expiresAt: dayjs().add(1, 'hour').toDate(),
        token,
      },
    });
  };

  const clearPendingChangePasswordRequests = async (email?: string) => {
    if (email) {
      await db.changePasswordRequest.deleteMany({ where: { email } });

      return;
    }

    await db.changePasswordRequest.deleteMany({
      where: {
        expiresAt: {
          lte: dayjs().toDate(),
        },
      },
    });
  };

  const changePassword = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Find identity directly by email
    let identity = await db.identity.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    // 2. If not found directly by email, check via employee workEmail and identityId
    if (!identity) {
      const employee = await db.employee.findFirst({
        where: {
          workEmail: normalizedEmail,
        },
      });

      if (employee && employee.identityId) {
        identity = await db.identity.findFirst({
          where: {
            id: employee.identityId,
          },
        });
      }
    }

    if (!identity) {
      console.error('[CHANGE_PASSWORD_REPOSITORY_ERROR] Identity not found for email:', normalizedEmail);
      throw new Error(`Identity record not found for email: ${normalizedEmail}`);
    }

    // 3. Update password and sync email by Primary Key ID
    await db.identity.update({
      where: {
        id: identity.id,
      },
      data: {
        password,
        email: normalizedEmail,
      },
    });
  };

  return {
    createChangePasswordRequest,
    clearPendingChangePasswordRequests,
    changePassword,
  };
}
