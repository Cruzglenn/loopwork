import { type OrganizationContext } from '@/api/hris';
import { requirePermission, privateRoute, type PermissionChecker } from '@/api/hris/authorization';
import { ResourceType, PermissionAction } from '@/api/hris/authorization/permissions';
import { type CUID } from '@/shared';
import { emailSenderService } from '@/api/hris/acl/email-service.acl';
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
  approvePayrollRunUseCase,
  markPayrollRunPaidUseCase,
  dispatchPayslipEmailsUseCase,
} from '../../model/use-cases';

export function payrollController(organization: OrganizationContext) {
  const repository = payrollRepository(organization.db);
  const queries = payrollQueries(organization.db);

  const generatePayrollRun = async (_checker: PermissionChecker, dto: GeneratePayrollRunDto) => {
    return generatePayrollRunUseCase(repository, organization.db)(dto);
  };

  const approvePayrollRun = async (checker: PermissionChecker, runId: CUID) => {
    return approvePayrollRunUseCase(repository)(runId, checker.getIdentityId());
  };

  const markPayrollRunPaid = async (_checker: PermissionChecker, runId: CUID) => {
    const emailService = await emailSenderService();
    return markPayrollRunPaidUseCase(repository, emailService)(runId);
  };

  const resendPayrollRunEmails = async (_checker: PermissionChecker, runId: CUID) => {
    const run = await repository.findPayrollRunById(runId);
    if (!run) throw new Error('Payroll run not found');
    const emailService = await emailSenderService();
    dispatchPayslipEmailsUseCase(repository, emailService)(run).catch(() => {});
    return { success: true };
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

  const getPayrollRunById = async (_checker: PermissionChecker, id: CUID) => {
    return queries.getPayrollRunById(id);
  };

  const getAllPayrollRuns = async (_checker: PermissionChecker) => {
    return queries.getAllPayrollRuns();
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
    approvePayrollRun: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.EDIT,
      approvePayrollRun,
    ),
    markPayrollRunPaid: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.EDIT,
      markPayrollRunPaid,
    ),
    resendPayrollRunEmails: requirePermission(
      ResourceType.COMPANY_PAYROLL,
      PermissionAction.EDIT,
      resendPayrollRunEmails,
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
    getPayrollRunById: privateRoute(getPayrollRunById),
    getAllPayrollRuns: privateRoute(getAllPayrollRuns),
  };
}
