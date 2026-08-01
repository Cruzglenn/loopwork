import { redirect } from 'next/navigation';
import { type PropsWithChildren } from 'react';
import { getPermissionChecker } from '@/api/hris/authorization';
import { PermissionAction, ResourceType } from '@/api/hris/authorization/permissions';
import { HRIS_ROUTES } from '@/shared';

export default async function Layout({ children }: PropsWithChildren) {
  const permissionChecker = await getPermissionChecker();

  const canViewAttendance = permissionChecker.can(ResourceType.COMPANY_ATTENDANCE, PermissionAction.VIEW);

  if (!canViewAttendance) {
    return redirect(HRIS_ROUTES.dashboard);
  }

  return children;
}
