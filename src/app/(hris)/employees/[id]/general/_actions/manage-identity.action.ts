'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { hrisApi } from '@/api/hris';
import { type CUID, handleActionError, type ActionReturnType, HRIS_ROUTES } from '@/shared';
import { type RoleListItemDto } from '@/api/hris/authorization/infrastructure/controllers/roles.controller';
import { StringTools } from '@/shared/utils/string-tools';
import { sendInviteService } from '@/api/hris/authentication/infrastructure/service/invite.service';
import {
  createIdentitySchema,
  type CreateIdentityForm,
  type UpdateIdentityForm,
} from '../_schemas/application-access.schema';

type CreateIdentityState = ActionReturnType<
  CreateIdentityForm,
  undefined,
  Record<string, string[] | undefined>
>;
type UpdateIdentityState = ActionReturnType<
  UpdateIdentityForm,
  undefined,
  Record<string, string[] | undefined>
>;

// Helper to convert role ID to key (handles both ID and key inputs)
async function getRoleKey(
  roleIdOrKey: string | undefined,
  allRoles: RoleListItemDto[],
): Promise<string | undefined> {
  if (!roleIdOrKey) return undefined;

  const roleByKey = allRoles.find((r) => r.key === roleIdOrKey);
  if (roleByKey) return roleByKey.key;

  const roleById = allRoles.find((r) => r.id === roleIdOrKey);
  return roleById?.key;
}

// Helper to update employee status to ACTIVE if needed (when identity is created)
async function updateEmployeeStatusIfNeeded(api: typeof hrisApi, employeeId: CUID): Promise<void> {
  const employee = await api.employees.getEmployeeById(employeeId);
  if (employee && employee.status === 'ARCHIVED') {
    await api.employees.updateEmployeeStatus(employeeId, 'ACTIVE');
  }
}

export async function createIdentityAction(
  prevState: CreateIdentityState,
  formData: FormData,
): Promise<CreateIdentityState> {
  const sendNotification =
    formData.get('sendNotification') === 'true' || formData.get('saveAndNotify') !== null;
  const rawRoleKey = formData.get('roleKey') as string;
  const form: CreateIdentityForm = {
    email: formData.get('email') as string,
    password: (formData.get('password') as string) || undefined,
    confirmPassword: (formData.get('confirmPassword') as string) || undefined,
    roleKey: rawRoleKey && rawRoleKey.trim() !== '' ? rawRoleKey : '',
  };

  const validation = createIdentitySchema.safeParse(form);
  if (!validation.success) {
    return {
      ...prevState,
      form,
      status: 'validation-error',
      errors: validation.error.flatten().fieldErrors,
    };
  }

  // If sending notification, create identity with email invitation
  if (sendNotification) {
    try {
      const api = hrisApi;
      const employeeId = formData.get('employeeId') as CUID;

      const allRoles = await api.authorization.roles.getAllRoles();
      const roleKey = await getRoleKey(validation.data.roleKey, allRoles);

      let identityId: string;
      const existingIdentity = await api.auth.getIdentityByEmail(validation.data.email);

      if (existingIdentity) {
        identityId = existingIdentity.id;
        const tempPassword = StringTools.createRandomString(12);
        await api.auth.updateIdentity(identityId, { password: tempPassword });
        if (roleKey) {
          const currentRoles = await api.authorization.roles.getRolesForIdentity(identityId);
          const roleToAssign = allRoles.find((r) => r.key === roleKey);
          if (roleToAssign && !currentRoles.some((r) => r.id === roleToAssign.id)) {
            for (const role of currentRoles) {
              if (!role.isSystem) {
                await api.authorization.roles.removeRoleFromIdentity(identityId, role.id);
              }
            }
            await api.authorization.roles.assignRoleToIdentity(identityId, roleToAssign.id);
          }
        }
        await sendInviteService().sendInvite({ email: validation.data.email, tempPassword });
      } else {
        identityId = await api.auth.createIdentity(validation.data.email, roleKey);
      }

      await updateEmployeeStatusIfNeeded(api, employeeId);
      await api.employees.updateEmployeeGeneralInfo(employeeId, { identityId });

      revalidatePath(HRIS_ROUTES.employees.general.base(employeeId));

      return {
        ...prevState,
        status: 'success',
        form,
        data: undefined,
      };
    } catch (err) {
      return { ...prevState, form, ...handleActionError(err) };
    }
  }

  // Manual creation with password (requires password >= 8 characters)
  if (!form.password || form.password.length < 8) {
    return {
      ...prevState,
      form,
      status: 'validation-error',
      errors: { password: ['Password must be at least 8 characters'] },
    };
  }

  try {
    const api = hrisApi;
    const employeeId = formData.get('employeeId') as CUID;

    const allRoles = await api.authorization.roles.getAllRoles();
    const roleKey = await getRoleKey(validation.data.roleKey, allRoles);

    let identityId: string;
    const existingIdentity = await api.auth.getIdentityByEmail(validation.data.email);

    if (existingIdentity) {
      identityId = existingIdentity.id;
      await api.auth.updateIdentity(identityId, { password: form.password });
      if (roleKey) {
        const currentRoles = await api.authorization.roles.getRolesForIdentity(identityId);
        const roleToAssign = allRoles.find((r) => r.key === roleKey);
        if (roleToAssign && !currentRoles.some((r) => r.id === roleToAssign.id)) {
          for (const role of currentRoles) {
            if (!role.isSystem) {
              await api.authorization.roles.removeRoleFromIdentity(identityId, role.id);
            }
          }
          await api.authorization.roles.assignRoleToIdentity(identityId, roleToAssign.id);
        }
      }
    } else {
      identityId = await api.auth.createIdentityManually(validation.data.email, form.password, roleKey);
    }

    await updateEmployeeStatusIfNeeded(api, employeeId);
    await api.employees.updateEmployeeGeneralInfo(employeeId, { identityId });

    revalidatePath(HRIS_ROUTES.employees.general.base(employeeId));

    return {
      ...prevState,
      status: 'success',
      form,
      data: undefined,
    };
  } catch (err) {
    return { ...prevState, form, ...handleActionError(err) };
  }
}

export async function updateIdentityAction(
  prevState: UpdateIdentityState,
  formData: FormData,
): Promise<UpdateIdentityState> {
  const sendNotification =
    formData.get('sendNotification') === 'true' || formData.get('saveAndNotify') !== null;
  const rawRoleKey = formData.get('roleKey') as string;
  const form: UpdateIdentityForm = {
    email: (formData.get('email') as string) || undefined,
    password: (formData.get('password') as string) || undefined,
    confirmPassword: (formData.get('confirmPassword') as string) || undefined,
    roleKey: rawRoleKey && rawRoleKey.trim() !== '' ? rawRoleKey : undefined,
  };

  // Validate passwords if provided
  if (form.password || form.confirmPassword) {
    const passwordValidation = z
      .object({
        password: z.string().min(8),
        confirmPassword: z.string().min(8),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
      .safeParse({ password: form.password || '', confirmPassword: form.confirmPassword || '' });

    if (!passwordValidation.success) {
      return {
        ...prevState,
        form,
        status: 'validation-error',
        errors: passwordValidation.error.flatten().fieldErrors,
      };
    }
  }

  if (form.email) {
    const emailValidation = z.string().email().safeParse(form.email);
    if (!emailValidation.success) {
      return {
        ...prevState,
        form,
        status: 'validation-error',
        errors: { email: ['Invalid email'] },
      };
    }
  }

  try {
    const api = hrisApi;
    const identityId = formData.get('identityId') as CUID;
    const employeeId = formData.get('employeeId') as CUID;

    // Get current identity to compare email
    const currentIdentity = await api.auth.getIdentityById(identityId);
    if (!currentIdentity) {
      return { ...prevState, ...handleActionError(new Error('Identity not found')) };
    }

    const targetEmail = form.email && form.email.trim() !== '' ? form.email : currentIdentity.email;
    const updates: { email?: string; password?: string } = {};

    // Only update email if provided and different from current email
    if (form.email && form.email.trim() !== '' && form.email !== currentIdentity.email) {
      updates.email = form.email;
      if (employeeId) {
        await api.employees.updateEmployeeGeneralInfo(employeeId, { workEmail: form.email });
      }
    }

    let tempPassword = form.password;

    // If sendNotification is true, ensure password exists or generate one and dispatch email
    if (sendNotification) {
      if (!tempPassword || tempPassword.trim() === '') {
        tempPassword = StringTools.createRandomString(12);
      }
      updates.password = tempPassword;
    } else if (form.password && form.password.trim() !== '') {
      updates.password = form.password;
    }

    if (Object.keys(updates).length > 0) {
      await api.auth.updateIdentity(identityId, updates);
    }

    if (sendNotification && tempPassword) {
      await sendInviteService().sendInvite({ email: targetEmail, tempPassword });
    }

    // Handle role update if provided
    if (form.roleKey) {
      const currentRoles = await api.authorization.roles.getRolesForIdentity(identityId);
      const allRoles = await api.authorization.roles.getAllRoles();
      const roleKey = await getRoleKey(form.roleKey, allRoles);
      const roleToAssign = allRoles.find((r) => r.key === roleKey);

      if (roleToAssign) {
        const isAlreadyAssigned = currentRoles.some((r) => r.id === roleToAssign.id);

        if (!isAlreadyAssigned) {
          // Remove all non-system roles and add the new one
          for (const role of currentRoles) {
            if (!role.isSystem) {
              await api.authorization.roles.removeRoleFromIdentity(identityId, role.id);
            }
          }
          await api.authorization.roles.assignRoleToIdentity(identityId, roleToAssign.id);
        }
      }
    }

    if (employeeId) {
      revalidatePath(HRIS_ROUTES.employees.general.base(employeeId));
    }

    return {
      ...prevState,
      status: 'success',
      form,
      data: undefined,
    };
  } catch (err) {
    return { ...prevState, form, ...handleActionError(err) };
  }
}

export async function reinviteIdentityAction(identityId: CUID, employeeId: CUID) {
  try {
    const api = hrisApi;
    const identity = await api.auth.getIdentityById(identityId);
    if (!identity) {
      return { status: 'error' as const, error: 'Identity not found' };
    }

    const tempPassword = StringTools.createRandomString(12);
    await api.auth.updateIdentity(identityId, { password: tempPassword });
    await sendInviteService().sendInvite({ email: identity.email, tempPassword });

    revalidatePath(HRIS_ROUTES.employees.general.base(employeeId));

    return {
      status: 'success' as const,
    };
  } catch (err) {
    return { ...handleActionError(err) };
  }
}

export async function deleteIdentityAction(identityId: CUID, employeeId: CUID) {
  try {
    const api = hrisApi;

    await api.auth.deleteIdentity(identityId);
    await api.employees.updateEmployeeGeneralInfo(employeeId, { identityId: null });

    revalidatePath(HRIS_ROUTES.employees.general.base(employeeId));

    return {
      status: 'success' as const,
    };
  } catch (err) {
    return { ...handleActionError(err) };
  }
}
