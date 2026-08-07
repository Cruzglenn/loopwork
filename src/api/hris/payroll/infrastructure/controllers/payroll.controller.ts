import { type OrganizationContext } from '@/api/hris';
import { requirePermission, privateRoute, type PermissionChecker } from '@/api/hris/authorization';
import { ResourceType, PermissionAction } from '@/api/hris/authorization/permissions';
import { type CUID } from '@/shared';
import { payrollRepository } from '../database/repositories/payroll.repository';
import { payrollQueries } from '../database/queries/payroll.queries';
import {
  type GeneratePayrollRunDto,
  type PayrollStatusDto,
  type UpdateSalaryConfigDto,
} from '../../model/dtos/payroll.dto';
import {
  generatePayrollRunUseCase,
  updateSalaryConfigUseCase,
  updatePayslipStatusUseCase,
} from '../../model/use-cases';

export function payrollController(organization: OrganizationContext) {
  const repository = payrollRepository(organization.db);
  const queries = payrollQueries(organization.db);

  const generatePayrollRun = async (_checker: PermissionChecker, dto: GeneratePayrollRunDto) => {
    return generatePayrollRunUseCase(repository, organization.db)(dto);
  };

  const updateSalaryConfig = async (_checker: PermissionChecker, dto: UpdateSalaryConfigDto) => {
    return updateSalaryConfigUseCase(repository)(dto);
  };

  const updatePayslipStatus = async (
    _checker: PermissionChecker,
    payslipId: CUID,
    status: PayrollStatusDto,
  ) => {
    return updatePayslipStatusUseCase(repository)(payslipId, status);
  };

  const getSalaryConfig = async (_checker: PermissionChecker, employeeId: CUID) => {
    return queries.getSalaryConfig(employeeId);
  };

  const getPayslipById = async (_checker: PermissionChecker, id: CUID) => {
    return queries.getPayslipById(id);
  };

  const getEmployeePayslips = async (_checker: PermissionChecker, employeeId: CUID) => {
    return queries.getEmployeePayslips(employeeId);
  };

  const getCompanyPayrollOverview = async (
    _checker: PermissionChecker,
    startDate?: Date,
    endDate?: Date,
    statusFilter?: string,
    search?: string,
    page?: number,
    perPage?: number,
  ) => {
    return queries.getCompanyPayrollOverview(startDate, endDate, statusFilter, search, page, perPage);
  };

  return {
    generatePayrollRun: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.CREATE,
      generatePayrollRun,
    ),
    updateSalaryConfig: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.EDIT,
      updateSalaryConfig,
    ),
    updatePayslipStatus: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.EDIT,
      updatePayslipStatus,
    ),
    getCompanyPayrollOverview: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.VIEW,
      getCompanyPayrollOverview,
    ),
    getSalaryConfig: privateRoute(getSalaryConfig),
    getPayslipById: privateRoute(getPayslipById),
    getEmployeePayslips: privateRoute(getEmployeePayslips),
  };
}
