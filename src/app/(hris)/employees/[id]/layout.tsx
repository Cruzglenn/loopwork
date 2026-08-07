import { type PropsWithChildren } from 'react';
import { type Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { HRIS_ROUTES, type CUID } from '@/shared';
import { hrisApi } from '@/api/hris';
import { getEmployeeViewAccess, getPermissionChecker } from '@/api/hris/authorization';

type Props = { params: Promise<{ id: CUID }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'employees.seo' });

  const api = hrisApi;

  try {
    const employee = await api.employees.getEmployeeById(params.id);
    if (!employee) return { title: 'Employee Profile' };
    return {
      title: t('employeeTitle', { employeeName: `${employee.firstName} ${employee.lastName}` }),
    };
  } catch {
    return { title: 'Employee Profile' };
  }
}

export default async function EmployeesLayout(props: PropsWithChildren<Props>) {
  const params = await props.params;
  const api = hrisApi;
  let me;
  let permissionChecker;

  try {
    [me, permissionChecker] = await Promise.all([api.auth.getMe(), getPermissionChecker()]);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return redirect(HRIS_ROUTES.dashboard);
  }

  const { canView, hasCompanyWideAccess } = getEmployeeViewAccess(permissionChecker);

  // Main nav is permission-filtered, so reaching here without any view grant means a
  // direct navigation. Dashboard is the safe fallback — its widgets are already gated
  // per permission and render gracefully for minimal roles.
  if (!canView) {
    return redirect(HRIS_ROUTES.dashboard);
  }

  if (!hasCompanyWideAccess && me.id !== params.id) {
    try {
      const myEmployee = await api.employees.getEmployeeById(me.id);
      if (!myEmployee || (myEmployee.id !== params.id && myEmployee.identityId !== params.id)) {
        return redirect(HRIS_ROUTES.employees.general.base(me.id));
      }
    } catch {
      return redirect(HRIS_ROUTES.employees.general.base(me.id));
    }
  }

  return <div className="flex min-h-full flex-col">{props.children}</div>;
}
