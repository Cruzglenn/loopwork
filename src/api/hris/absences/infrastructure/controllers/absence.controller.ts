import { type SchedulerData } from '@bitnoi.se/react-scheduler';
import dayjs from 'dayjs';
import { type OrganizationContext } from '@/api/hris';
import { parseAbsencesData, type AbsenceListOrderBy, type CUID, ApiError } from '@/shared';
import { requirePermission, privateRoute, type PermissionChecker } from '@/api/hris/authorization';
import { ResourceType, PermissionAction, PermissionScope } from '@/api/hris/authorization/permissions';
import { checkResourcePermission } from '@/api/hris/authorization/permissionChecker';
import { type AbsenceType, type AbsenceStatus } from '@/api/hris/prisma/client';
import { employeeQueries } from '@/api/hris/employees/infrastructure/database/queries';
import { emailSenderService } from '@/api/hris/acl/email-service.acl';
import { parseAbsencesToEvents } from '@/shared/utils/parseAbsencesToEvents';
import { absenceRepository } from '../database/repositories/absence.repository';
import {
  type AbsenceDTO,
  type AbsenceListDto,
  type RequestAbsenceDTO,
  type AbsenceAction,
} from '../../model/dtos/absence.dto';
import { requestAbsenceUseCase } from '../../model/use-cases/request-absence.use-case';
import { approveAbsenceUseCase } from '../../model/use-cases/approve-absence.use-case';
import { rejectAbsenceUseCase } from '../../model/use-cases/reject-absence.use-case';
import { absenceQueries } from '../database/queries/absence.queries';
import { ABSENCE_LIST_ACCESS } from '../../model/dtos/access';

import { employeesAcl } from '../acl/employee.acl';
import { deleteAbsenceUseCase } from '../../model/use-cases/delete-absence.use-case';
import { authAcl } from '../acl/auth.acl';

export function absenceController(organization: OrganizationContext) {
  const absenceRepositoryImpl = absenceRepository(organization.db);
  const absenceQueriesImpl = absenceQueries(organization.db);
  const employeesAclImpl = employeesAcl(organization);
  const authAclImpl = authAcl(organization);
  const employeeQueriesImpl = employeeQueries(organization);

  const requestAbsence = async (checker: PermissionChecker, absence: RequestAbsenceDTO) => {
    // Check if user can create absences
    const canCreate = checker.can(ResourceType.EMPLOYEE_ABSENCES, PermissionAction.CREATE);
    const scope = checker.getScope(ResourceType.EMPLOYEE_ABSENCES);

    if (!canCreate) {
      throw new ApiError(403, 'Forbidden: No permission to create absences');
    }

    // If scope is SELF, verify this is for the current user's employee record
    if (scope === PermissionScope.SELF) {
      const currentEmployee = await employeeQueriesImpl.getEmployeeByIdentityId(checker.getIdentityId());
      if (!currentEmployee || currentEmployee.id !== absence.issuerId) {
        throw new ApiError(403, 'Forbidden: Can only create absences for own employee record');
      }
    }

    return requestAbsenceUseCase(absenceRepositoryImpl, employeesAclImpl)(absence);
  };

  const approveAbsence = async (checker: PermissionChecker, absenceId: CUID[] | 'all', reviewerId: CUID) => {
    // Require company-level edit/manage permission to approve absences
    const canApproveCompanyAbsences =
      checker.isOwner() || checker.can(ResourceType.COMPANY_ABSENCES, PermissionAction.EDIT);
    if (!canApproveCompanyAbsences) {
      throw new ApiError(403, 'Forbidden: No permission to approve absences');
    }

    let ids: CUID[] = [];
    const user = await authAclImpl.getLoggedInUser();

    if (absenceId === 'all') {
      const allAbsences = await absenceQueriesImpl.getAllAbsences(
        1,
        undefined,
        undefined,
        undefined,
        ['HOLIDAY', 'PERSONAL', 'SICK'],
        undefined,
        'all',
      );

      ids = allAbsences.items.map((absence) => absence.id);
    } else {
      ids = absenceId;
    }

    // Verify self-approval: reviewer cannot approve their own absence request
    const currentEmployee = await employeeQueriesImpl.getEmployeeByIdentityId(checker.getIdentityId());
    if (currentEmployee) {
      for (const id of ids) {
        const targetAbsence = await absenceRepositoryImpl.getAbsenceById(id);
        if (targetAbsence && targetAbsence.issuerId === currentEmployee.id) {
          throw new ApiError(403, 'Forbidden: You cannot approve your own absence request');
        }
      }
    }

    await approveAbsenceUseCase(absenceRepositoryImpl, employeesAclImpl, await emailSenderService())(
      ids,
      reviewerId,
      user.locale,
    );
  };

  const rejectAbsence = async (checker: PermissionChecker, absenceId: CUID[] | 'all', reviewerId: CUID) => {
    // Require company-level edit/manage permission to reject absences
    const canRejectCompanyAbsences =
      checker.isOwner() || checker.can(ResourceType.COMPANY_ABSENCES, PermissionAction.EDIT);
    if (!canRejectCompanyAbsences) {
      throw new ApiError(403, 'Forbidden: No permission to reject absences');
    }

    let ids: CUID[] = [];
    const user = await authAclImpl.getLoggedInUser();

    if (absenceId === 'all') {
      const allAbsences = await absenceQueriesImpl.getAllAbsences(
        1,
        undefined,
        undefined,
        undefined,
        ['HOLIDAY', 'PERSONAL', 'SICK'],
        undefined,
        'all',
      );

      ids = allAbsences.items.map((absence) => absence.id);
    } else {
      ids = absenceId;
    }

    // Verify self-rejection: reviewer cannot reject their own absence request
    const currentEmployee = await employeeQueriesImpl.getEmployeeByIdentityId(checker.getIdentityId());
    if (currentEmployee) {
      for (const id of ids) {
        const targetAbsence = await absenceRepositoryImpl.getAbsenceById(id);
        if (targetAbsence && targetAbsence.issuerId === currentEmployee.id) {
          throw new ApiError(403, 'Forbidden: You cannot reject your own absence request');
        }
      }
    }

    await rejectAbsenceUseCase(absenceRepositoryImpl, employeesAclImpl, await emailSenderService())(
      ids,
      reviewerId,
      user.locale,
    );
  };

  const getAllAbsences = async (
    checker: PermissionChecker,
    page: number,
    startDate?: Date,
    endDate?: Date,
    statusFilter?: AbsenceStatus[],
    typesFilter?: AbsenceType[],
    orderBy?: AbsenceListOrderBy,
    itemsPerPage?: number | 'all',
    issuerIds?: CUID[],
    reviewerIds?: CUID[],
  ): Promise<AbsenceListDto> => {
    // Check if user can view absences (company or employee level)
    const permissionCheck = checkResourcePermission(
      checker,
      ResourceType.COMPANY_ABSENCES,
      PermissionAction.VIEW,
    );

    if (!permissionCheck.hasPermission) {
      throw new ApiError(403, 'Forbidden: No permission to view absences');
    }

    // If employee permission with SELF scope, enforce ownership verification and restrict to current user's employee ID
    if (permissionCheck.requiresOwnershipVerification) {
      const currentEmployee = await employeeQueriesImpl.getEmployeeByIdentityId(checker.getIdentityId());
      if (!currentEmployee) {
        throw new ApiError(403, 'Forbidden: Can only view own absences');
      }
      if (issuerIds && issuerIds.length > 0) {
        const filteredIssuerIds = issuerIds.filter((id) => id === currentEmployee.id);
        if (filteredIssuerIds.length === 0) {
          // No valid absences to show
          return {
            items: [],
            totalItems: 0,
            totalPages: 0,
            nextPage: null,
            prevPage: null,
            _access: {
              actions: [],
            },
          };
        }
        issuerIds = filteredIssuerIds;
      } else {
        // Automatically constrain issuerIds to the logged-in employee's ID when SELF scope
        issuerIds = [currentEmployee.id];
      }
    } else if (!permissionCheck.hasPermission && issuerIds && issuerIds.length > 0) {
      // If no company permission but issuerIds provided, check employee permission
      const canViewEmployee = checker.can(ResourceType.EMPLOYEE_ABSENCES, PermissionAction.VIEW);
      const employeeScope = checker.getScope(ResourceType.EMPLOYEE_ABSENCES);

      if (!canViewEmployee) {
        throw new ApiError(403, 'Forbidden: No permission to view absences');
      }

      // If scope is SELF, verify all issuerIds belong to the current user's employee record
      if (employeeScope === PermissionScope.SELF) {
        const currentEmployee = await employeeQueriesImpl.getEmployeeByIdentityId(checker.getIdentityId());
        if (!currentEmployee) {
          throw new ApiError(403, 'Forbidden: Can only view own absences');
        }
        // Filter to only show absences for the current user's employee record
        const filteredIssuerIds = issuerIds.filter((id) => id === currentEmployee.id);
        if (filteredIssuerIds.length === 0) {
          // No valid absences to show
          return {
            items: [],
            totalItems: 0,
            totalPages: 0,
            nextPage: null,
            prevPage: null,
            _access: {
              actions: [],
            },
          };
        }
        // Use filtered issuerIds
        issuerIds = filteredIssuerIds;
      }
    }

    const absences = await absenceQueriesImpl.getAllAbsences(
      page,
      startDate,
      endDate,
      statusFilter,
      typesFilter,
      orderBy,
      itemsPerPage,
      issuerIds,
      reviewerIds,
    );

    // Determine access based on permissions
    // Use COMPANY_ABSENCES for company-wide view, EMPLOYEE_ABSENCES for employee-specific view
    const isCompanyView = !issuerIds || issuerIds.length === 0;
    const resourceType = isCompanyView ? ResourceType.COMPANY_ABSENCES : ResourceType.EMPLOYEE_ABSENCES;

    const canView = checker.can(resourceType, PermissionAction.VIEW);
    const canCreate = checker.can(resourceType, PermissionAction.CREATE);
    const canDelete = checker.can(resourceType, PermissionAction.DELETE);
    const isOwner = checker.isOwner();
    const canApproveOrReject = isOwner || checker.can(ResourceType.COMPANY_ABSENCES, PermissionAction.EDIT);

    // Use owner access if owner, otherwise build actions based on permissions
    const actions: AbsenceAction[] = isOwner
      ? ABSENCE_LIST_ACCESS.OWNER
      : canView
        ? ([
            // Always include filter and select if user can view
            'filter',
            'select',
            // Add create if user has CREATE permission
            ...(canCreate ? (['create'] as const) : []),
            // Add approve/reject only if user has company-level edit/manage permission
            ...(canApproveOrReject ? (['approve', 'reject'] as const) : []),
            // Add delete if user has DELETE permission
            ...(canDelete ? (['delete'] as const) : []),
          ] as AbsenceAction[])
        : [];

    return {
      ...absences,
      _access: {
        actions,
      },
    };
  };

  const getSchedulerAvailabilityData = async (
    checker: PermissionChecker,
    from: string,
    to: string,
    status: AbsenceStatus[],
  ): Promise<SchedulerData> => {
    const user = await authAclImpl.getLoggedInUser();
    const parsedStartDate = from ? new Date(from) : dayjs().subtract(2, 'week').toDate();
    const parsedEndDate = to ? new Date(to) : dayjs().add(2, 'week').toDate();
    const absencesData = await absenceQueriesImpl.getAllAbsences(
      1,
      parsedStartDate,
      parsedEndDate,
      status,
      undefined,
      undefined,
      'all',
    );

    const employees = await employeesAclImpl.getAllEmployees();

    const absencesByIssuer = new Map<CUID, AbsenceDTO[]>();

    for (const employee of employees) {
      absencesByIssuer.set(employee.id, []);
    }

    for (const absence of absencesData.items) {
      if (absence.type === 'GLOBAL') {
        absencesByIssuer.forEach((absences) => {
          absences.push(absence);
        });
      } else {
        absencesByIssuer.get(absence.issuerId)?.push(absence);
      }
    }

    const parsedEmployeesWithAbsences = employees.map((employee) => ({
      ...employee,
      absences: absencesByIssuer.get(employee.id) || [],
    }));

    return await parseAbsencesData(parsedEmployeesWithAbsences, user.locale);
  };

  const deleteAbsence = async (checker: PermissionChecker, absenceIds: CUID[] | 'all') => {
    // Check if user can delete company absences
    const canDelete = checker.can(ResourceType.COMPANY_ABSENCES, PermissionAction.DELETE);
    if (!canDelete) {
      throw new ApiError(403, 'Forbidden: No permission to delete absences');
    }

    await deleteAbsenceUseCase(absenceRepositoryImpl)(absenceIds);
  };

  const getAllAbsencesForCalendar = async () => {
    const absences = await absenceQueriesImpl.getAllAbsencesForCalendar();
    return absences;
  };

  const getAbsenceEvents = async (checker: PermissionChecker, from: Date, to: Date, filters?: string[]) => {
    const user = await authAclImpl.getLoggedInUser();
    const isAdmin = checker.isOwner();

    let joinedEmployeeIds = filters;

    if (!isAdmin) {
      joinedEmployeeIds = [user.id];
    }

    const [employeeAbsences, globalAbsences] = await Promise.all([
      absenceQueriesImpl.getAllAbsences(
        1,
        from,
        to,
        ['APPROVED', 'PENDING'],
        ['HOLIDAY', 'PERSONAL', 'SICK'],
        undefined,
        'all',
        joinedEmployeeIds?.length ? joinedEmployeeIds : undefined,
        undefined,
      ),
      absenceQueriesImpl.getAllAbsences(1, from, to, ['APPROVED'], ['GLOBAL']),
    ]);

    const employees = await employeesAclImpl.getEmployeesById(employeeAbsences.items.map((a) => a.issuerId));

    const employeesMap = employees.reduce(
      (acc, curr) => {
        acc[curr.id] = `${curr.firstName} ${curr.lastName}`;

        return acc;
      },
      {} as Record<CUID, string>,
    );

    const events = parseAbsencesToEvents([...globalAbsences.items, ...employeeAbsences.items]);

    const parsedEvents = events.map(({ employee, ...event }) => ({
      ...event,
      employee: employee.length ? [employeesMap[employee[0]]] : [],
    }));

    return parsedEvents;
  };

  return {
    getAllIssuerAbsenceDaysCount: privateRoute(absenceQueriesImpl.getAllIssuerAbsenceDaysCount),
    getAllAbsences: privateRoute(getAllAbsences),
    getAllAbsencesForCalendar: getAllAbsencesForCalendar,
    getSchedulerAvailabilityData: privateRoute(getSchedulerAvailabilityData),
    requestAbsence: privateRoute(requestAbsence),
    approveAbsence: privateRoute(approveAbsence),
    rejectAbsence: privateRoute(rejectAbsence),
    deleteAbsence: requirePermission(ResourceType.COMPANY_ABSENCES, PermissionAction.DELETE, deleteAbsence),
    getAbsenceEvents: privateRoute(getAbsenceEvents),
  };
}
