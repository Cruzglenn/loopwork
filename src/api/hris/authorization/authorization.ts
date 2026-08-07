import * as React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { ApiError, AUTH_ROUTES } from '@/shared';
import { type CUID } from '@/api/hris/types';
import { authenticateToken } from '@/api/hris/authorization/authenticateToken';
import { logger } from '@/shared/service/pino';
import { prisma } from '../prisma/client';
import { permissionRepository } from './infrastructure/database/repositories/permissionRepository';
import { createPermissionChecker, type PermissionChecker } from './permissionChecker';
import { type PermissionAction, type ResourceType } from './permissions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeCache = <T extends (...args: any[]) => any>(fn: T): T => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof (React as any).cache === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (React as any).cache(fn);
  }
  return fn;
};

const verifyTokenAndGetIdentity = safeCache(async () => {
  const token = (await cookies()).get('Authorization');
  if (!token) {
    redirect(AUTH_ROUTES.signIn);
  }
  try {
    return await authenticateToken(token.value);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    logger.warn('Authentication error', error);
    redirect(AUTH_ROUTES.signIn);
  }
});

export async function getLoggedIdentityId(): Promise<CUID> {
  return (await verifyTokenAndGetIdentity()).id;
}

// Request-scoped permission checker with caching
export const getPermissionChecker = safeCache(async (): Promise<PermissionChecker> => {
  const identity = await verifyTokenAndGetIdentity();

  // Single organization - use singleton prisma client
  const db = prisma;

  const permRepo = permissionRepository(db);
  const roles = await permRepo.getRolesByIdentityId(identity.id);
  return createPermissionChecker(roles, identity.id);
});

// Backward compatible: Keep existing functions but delegate to permission system
export async function getUserRoles() {
  const checker = await getPermissionChecker();
  return checker.getRoles();
}

export async function checkIsOwner(): Promise<boolean> {
  const checker = await getPermissionChecker();
  return checker.isOwner();
}

// New permission-based wrappers
export function requirePermission<TArgs extends unknown[], TReturn>(
  resource: ResourceType,
  action: PermissionAction,
  callback: (checker: PermissionChecker, ...args: TArgs) => Promise<TReturn> | TReturn,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      const checker = await getPermissionChecker();

      if (!checker.can(resource, action)) {
        throw new ApiError(403, 'Forbidden: Insufficient permissions');
      }

      return await callback(checker, ...args);
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        redirect(AUTH_ROUTES.signIn);
      }
      throw error;
    }
  };
}

export function privateRoute<TArgs extends unknown[], TReturn>(
  callback: (checker: PermissionChecker, ...args: TArgs) => Promise<TReturn> | TReturn,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      const checker = await getPermissionChecker();
      return await callback(checker, ...args);
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      if (error instanceof ApiError && error.status === 401) {
        logger.warn(`Unauthorized ApiError: ${error.message} with ${error.status}`, error);
        redirect(AUTH_ROUTES.signIn);
      }

      throw error;
    }
  };
}

// Backward compatible wrapper for owner-only routes
export function isOwnerRoute<TArgs extends unknown[], TReturn>(
  callback: (checker: PermissionChecker, ...args: TArgs) => Promise<TReturn> | TReturn,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    try {
      const checker = await getPermissionChecker();

      if (!checker.isOwner()) {
        throw new ApiError(403, 'Forbidden: Owner access required');
      }

      return await callback(checker, ...args);
    } catch (error: unknown) {
      if (isRedirectError(error)) throw error;
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        logger.warn(`Unauthorized ApiError: ${error.message} with ${error.status}`, error);
        redirect(AUTH_ROUTES.signIn);
      }
      throw error;
    }
  };
}

// Legacy wrapper for backward compatibility - delegates to isOwnerRoute
// This maintains backward compatibility with existing code that uses isOwner(callback)
export function isOwner<TArgs extends unknown[], TReturn>(
  callback: (...args: TArgs) => Promise<TReturn> | TReturn,
) {
  return isOwnerRoute(async (checker, ...args: TArgs) => {
    return await callback(...args);
  });
}
