import { redirect } from 'next/navigation';
import { type PropsWithChildren } from 'react';
import { HRIS_ROUTES, type CUID } from '@/shared';
import { hrisApi } from '@/api/hris';
import {
  getPermissionChecker,
  ResourceType,
  PermissionAction,
  PermissionScope,
} from '@/api/hris/authorization';

type Props = { params: Promise<{ id: CUID }> };

export default async function DocumentsLayout(props: PropsWithChildren<Props>) {
  const { id } = await props.params;
  const api = hrisApi;
  const [me, permissionChecker] = await Promise.all([api.auth.getMe(), getPermissionChecker()]);

  // Check if user has VIEW permission for EMPLOYEE_DOCUMENTS
  const canViewDocuments = permissionChecker.can(ResourceType.EMPLOYEE_DOCUMENTS, PermissionAction.VIEW);

  if (!canViewDocuments) {
    return redirect(HRIS_ROUTES.employees.general.base(id));
  }

  // Check scope: if SELF scope, only allow viewing own documents
  const scope = permissionChecker.getScope(ResourceType.EMPLOYEE_DOCUMENTS);
  if (scope === PermissionScope.SELF && me.id !== id) {
    try {
      const myEmployee = await api.employees.getEmployeeById(me.id);
      if (!myEmployee || (myEmployee.id !== id && myEmployee.identityId !== id)) {
        return redirect(HRIS_ROUTES.employees.general.base(id));
      }
    } catch {
      return redirect(HRIS_ROUTES.employees.general.base(id));
    }
  }

  return <>{props.children}</>;
}
