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
    const identity = await db.identity.findFirst({
      where: {
        email: normalizedEmail,
      },
    });

    if (identity) {
      await db.identity.update({
        where: {
          id: identity.id,
        },
        data: {
          password,
        },
      });
    } else {
      await db.identity.updateMany({
        where: {
          email: normalizedEmail,
        },
        data: {
          password,
        },
      });
    }
  };

  return {
    createChangePasswordRequest,
    clearPendingChangePasswordRequests,
    changePassword,
  };
}
