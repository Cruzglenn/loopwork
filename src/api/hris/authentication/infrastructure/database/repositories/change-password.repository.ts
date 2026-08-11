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

    // 2. Find employee by workEmail
    const employee = await db.employee.findFirst({
      where: {
        workEmail: normalizedEmail,
      },
    });

    // 3. If identity not found by email, check via employee.identityId
    if (!identity && employee && employee.identityId) {
      identity = await db.identity.findFirst({
        where: {
          id: employee.identityId,
        },
      });
    }

    // 4. If employee exists but identity does NOT exist yet (or identityId was null), create & link it
    if (!identity && employee) {
      const isOwnerCandidate =
        employee.role?.toLowerCase().includes('admin') || employee.role?.toLowerCase().includes('owner');
      const targetRoleKey = isOwnerCandidate ? 'OWNER' : 'EMPLOYEE';
      let role = await db.role.findFirst({ where: { key: targetRoleKey } });
      if (!role && !isOwnerCandidate) {
        role = await db.role.findFirst({ where: { key: 'EMPLOYEE' } });
      }

      const newIdentity = await db.identity.create({
        data: {
          email: normalizedEmail,
          password,
        },
      });

      await db.employee.update({
        where: { id: employee.id },
        data: { identityId: newIdentity.id },
      });

      if (role) {
        await db.identityRole.create({
          data: {
            identityId: newIdentity.id,
            roleId: role.id,
          },
        });
      }

      return;
    }

    if (!identity) {
      console.error('[CHANGE_PASSWORD_REPOSITORY_ERROR] Identity not found for email:', normalizedEmail);
      throw new Error(`Identity record not found for email: ${normalizedEmail}`);
    }

    // 5. Update existing identity password and sync email
    await db.identity.update({
      where: {
        id: identity.id,
      },
      data: {
        password,
        email: normalizedEmail,
      },
    });

    // Ensure employee is linked to identity if not already
    if (employee && !employee.identityId) {
      await db.employee.update({
        where: { id: employee.id },
        data: { identityId: identity.id },
      });
    }
  };

  return {
    createChangePasswordRequest,
    clearPendingChangePasswordRequests,
    changePassword,
  };
}
