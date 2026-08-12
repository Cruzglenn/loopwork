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
  const rawEmail = (formData.get('email') as string) || '';
  const normalizedEmail = rawEmail.trim().toLowerCase();

  const form: CreateIdentityForm = {
    email: normalizedEmail,
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

  const targetEmail = validation.data.email.trim().toLowerCase();

  // If sending notification, create/update identity with email invitation
  if (sendNotification) {
    try {
      const api = hrisApi;
      const employeeId = formData.get('employeeId') as CUID;

      const allRoles = await api.authorization.roles.getAllRoles();
      const roleKey = await getRoleKey(validation.data.roleKey, allRoles);

      let identityId: string;
      const existingIdentity = await api.auth.getIdentityByEmail(targetEmail);

      let tempPassword: string;
      if (
        validation.data.password &&
        validation.data.confirmPassword &&
        validation.data.password === validation.data.confirmPassword &&
        validation.data.password.length >= 8
      ) {
        tempPassword = validation.data.password;
      } else {
        tempPassword = StringTools.createRandomString(12);
      }

      if (existingIdentity) {
        identityId = existingIdentity.id;
        await api.auth.updateIdentity(identityId, { password: tempPassword, email: targetEmail });
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
        await sendInviteService().sendInvite({ email: targetEmail, tempPassword });
      } else {
        identityId = await api.auth.createIdentity(targetEmail, roleKey);
        if (
          validation.data.password &&
          validation.data.confirmPassword &&
          validation.data.password === validation.data.confirmPassword &&
          validation.data.password.length >= 8
        ) {
          await api.auth.updateIdentity(identityId, { password: tempPassword });
        }
      }

      await updateEmployeeStatusIfNeeded(api, employeeId);
      await api.employees.updateEmployeeGeneralInfo(employeeId, { identityId, workEmail: targetEmail });

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

  // Manual creation without email notification (requires password >= 8 characters)
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
    const existingIdentity = await api.auth.getIdentityByEmail(targetEmail);

    if (existingIdentity) {
      identityId = existingIdentity.id;
      await api.auth.updateIdentity(identityId, { password: form.password, email: targetEmail });
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
      identityId = await api.auth.createIdentityManually(targetEmail, form.password, roleKey);
    }

    await updateEmployeeStatusIfNeeded(api, employeeId);
    await api.employees.updateEmployeeGeneralInfo(employeeId, { identityId, workEmail: targetEmail });

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
  const rawEmail = (formData.get('email') as string) || '';
  const normalizedEmail = rawEmail.trim().toLowerCase();

  const form: UpdateIdentityForm = {
    email: normalizedEmail || undefined,
    password: (formData.get('password') as string) || undefined,
    confirmPassword: (formData.get('confirmPassword') as string) || undefined,
    roleKey: rawRoleKey && rawRoleKey.trim() !== '' ? rawRoleKey : undefined,
  };

  // Validate passwords if provided AND not sending email notification
  if (!sendNotification && (form.password || form.confirmPassword)) {
    if (!form.password || form.password.length < 8) {
      return {
        ...prevState,
        form,
        status: 'validation-error',
        errors: { password: ['Password must be at least 8 characters'] },
      };
    }
    if (form.password !== form.confirmPassword) {
      return {
        ...prevState,
        form,
        status: 'validation-error',
        errors: { confirmPassword: ['Passwords do not match'] },
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

    const currentEmailNormalized = currentIdentity.email.trim().toLowerCase();
    const targetEmail =
      form.email && form.email.trim() !== '' ? form.email.trim().toLowerCase() : currentEmailNormalized;
    const updates: { email?: string; password?: string } = {};

    // Only update email if provided and different from current email
    if (targetEmail !== currentEmailNormalized) {
      updates.email = targetEmail;
      if (employeeId) {
        await api.employees.updateEmployeeGeneralInfo(employeeId, { workEmail: targetEmail });
      }
    }

    let tempPassword: string | undefined;

    // If sendNotification is true, use valid custom password if provided, or generate a random temporary one
    if (sendNotification) {
      if (
        form.password &&
        form.confirmPassword &&
        form.password === form.confirmPassword &&
        form.password.length >= 8
      ) {
        tempPassword = form.password;
      } else {
        tempPassword = StringTools.createRandomString(12);
      }
      updates.password = tempPassword;
    } else if (
      form.password &&
      form.confirmPassword &&
      form.password === form.confirmPassword &&
      form.password.length >= 8
    ) {
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
