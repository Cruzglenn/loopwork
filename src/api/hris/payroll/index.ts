import { type OrganizationContext } from '@/api/hris';
import { payrollController } from './infrastructure/controllers/payroll.controller';

export type PayrollApi = ReturnType<typeof payrollApi>;

export function payrollApi(organizationContext: OrganizationContext) {
  return payrollController(organizationContext);
}
