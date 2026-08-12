import { type OrganizationPrismaClient } from '@/api/hris/prisma/client';
import { type IdentityRepository } from '@/api/hris/authentication/model/repository/identity-repository.type';
import { type IdentityDto } from '@/api/hris/authentication/model/dtos/identity.dto';
import { type CUID } from '@/api/hris/types';
import { type IdentityWithRoles, UserIdentityEntity } from '@/api/hris/authentication/model/entities';

export function identityRepository(db: OrganizationPrismaClient): IdentityRepository {
  return {
    createIdentity: async (identityDto: IdentityDto): Promise<CUID> => {
      const normalizedDto = {
        ...identityDto,
        email: identityDto.email.trim().toLowerCase(),
      };
      const identity = await db.identity.create({ data: normalizedDto });

      return identity.id;
    },
    deleteIdentity: async (id: CUID, isAdmin: boolean) => {
      await db.identityRole.deleteMany({ where: { identityId: id } });
      if (isAdmin) {
        await db.identityAdmin.deleteMany({ where: { identityId: id } });
      }
      await db.identity.delete({ where: { id } });
    },
    findIdentityByEmail: async (email: string): Promise<UserIdentityEntity | null> => {
      const normalizedEmail = email.trim().toLowerCase();
      const identity = await db.identity.findFirst({
        where: { email: normalizedEmail },
        include: {
          identityRole: {
            include: {
              role: {
                select: {
                  key: true,
                },
              },
            },
          },
        },
      });
      if (!identity) {
        return null;
      }

      return new UserIdentityEntity(<IdentityWithRoles>identity);
    },
    addOrganizationAdmin: async (adminId: CUID, identityId: CUID): Promise<void> => {
      await db.identityAdmin.create({ data: { adminId, identityId } });
    },

    getIdentityById: async (id: CUID): Promise<UserIdentityEntity | null> => {
      const identity = await db.identity.findFirst({
        where: { id },
        include: {
          identityRole: {
            include: {
              role: {
                select: {
                  key: true,
                },
              },
            },
          },
        },
      });
      if (!identity) {
        return null;
      }

      return new UserIdentityEntity(<IdentityWithRoles>identity);
    },
    updateIdentityEmail: async (id: CUID, email: string): Promise<void> => {
      await db.identity.update({
        where: { id },
        data: { email: email.trim().toLowerCase() },
      });
    },
    updateIdentityPassword: async (id: CUID, password: string): Promise<void> => {
      await db.identity.update({
        where: { id },
        data: { password },
      });
    },
  };
}
