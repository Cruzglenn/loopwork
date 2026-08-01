import { redirect } from 'next/navigation';
import { type PropsWithChildren } from 'react';
import { getPermissionChecker } from '@/api/hris/authorization';
import { PermissionAction, ResourceType } from '@/api/hris/authorization/permissions';
import { HRIS_ROUTES } from '@/shared';

export default async function Layout({ children }: PropsWithChildren) {
  const permissionChecker = await getPermissionChecker();

  const canViewPayroll = permissionChecker.can(ResourceType.COMPANY_PAYROLL, PermissionAction.VIEW);

  if (!canViewPayroll) {
    return redirect(HRIS_ROUTES.dashboard);
  }

  return children;
}
