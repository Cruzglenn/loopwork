import {
  type ResourceType,
  type PermissionAction,
  PermissionScope,
} from '../../../../.prisma-generated/organization-client';
import { prisma } from './client';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default organization
  const organization = await prisma.organization.upsert({
    where: { id: 'default-org-id' },
    update: {},
    create: {
      id: 'default-org-id',
      name: process.env.ORGANIZATION_NAME || 'Loopwork',
      taxId: process.env.ORGANIZATION_TAX_ID || null,
      foundedAt: new Date(),
    },
  });

  console.log('✅ Default organization created:', organization.name);

  // Create OWNER role if not exists
  const ownerRole = await prisma.role.upsert({
    where: { key: 'OWNER' },
    update: {},
    create: {
      key: 'OWNER',
      name: 'Owner',
      description: 'Full system access with all permissions',
      isSystem: true,
    },
  });

  console.log('✅ OWNER role created');

  // Define all resources and their permissions for OWNER
  const resources: ResourceType[] = [
    'EMPLOYEES',
    'COMPANY_ABSENCES',
    'COMPANY_DOCUMENTS',
    'COMPANY_EQUIPMENT',
    'COMPANY_BENEFITS',
    'COMPANY_SETTINGS',
    'EMPLOYEE_PROFILE',
    'EMPLOYEE_DOCUMENTS',
    'EMPLOYEE_EQUIPMENT',
    'EMPLOYEE_ABSENCES',
    'EMPLOYEE_FEEDBACK',
    'EMPLOYEE_EARNINGS',
  ];

  const allActions: PermissionAction[] = ['VIEW', 'CREATE', 'EDIT', 'DELETE', 'ASSIGN', 'EXPORT'];

  // Create permissions for OWNER role
  for (const resource of resources) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_resource: {
          roleId: ownerRole.id,
          resource: resource,
        },
      },
      update: {},
      create: {
        roleId: ownerRole.id,
        resource: resource,
        actions: allActions,
        scope: PermissionScope.ALL,
      },
    });
  }

  console.log('✅ OWNER role permissions configured');

  // Seed realistic Filipino employees with Philippine Peso salaries
  const filipinoEmployees = [
    {
      firstName: 'Juan',
      lastName: 'dela Cruz',
      workEmail: 'juan.delacruz@loopwork.com',
      role: 'Lead Software Engineer',
      baseSalary: 95000,
    },
    {
      firstName: 'Maria',
      lastName: 'Santos',
      workEmail: 'maria.santos@loopwork.com',
      role: 'HR Manager',
      baseSalary: 75000,
    },
    {
      firstName: 'Jose',
      lastName: 'Reyes',
      workEmail: 'jose.reyes@loopwork.com',
      role: 'Senior Finance Officer',
      baseSalary: 68000,
    },
    {
      firstName: 'Mark',
      lastName: 'Bautista',
      workEmail: 'mark.bautista@loopwork.com',
      role: 'Product Designer',
      baseSalary: 60000,
    },
    {
      firstName: 'Angela',
      lastName: 'Garcia',
      workEmail: 'angela.garcia@loopwork.com',
      role: 'Operations Specialist',
      baseSalary: 48000,
    },
    {
      firstName: 'Ramon',
      lastName: 'Mendoza',
      workEmail: 'ramon.mendoza@loopwork.com',
      role: 'QA Engineering Lead',
      baseSalary: 55000,
    },
    {
      firstName: 'Patricia',
      lastName: 'Ramos',
      workEmail: 'patricia.ramos@loopwork.com',
      role: 'Marketing Specialist',
      baseSalary: 50000,
    },
    {
      firstName: 'Gabriel',
      lastName: 'Aquino',
      workEmail: 'gabriel.aquino@loopwork.com',
      role: 'DevOps Engineer',
      baseSalary: 82000,
    },
  ];

  for (const emp of filipinoEmployees) {
    const existing = await prisma.employee.findFirst({
      where: { workEmail: emp.workEmail },
    });

    let employeeId = existing?.id;

    if (!existing) {
      const created = await prisma.employee.create({
        data: {
          firstName: emp.firstName,
          lastName: emp.lastName,
          workEmail: emp.workEmail,
          role: emp.role,
          status: 'ACTIVE',
        },
      });
      employeeId = created.id;
    } else {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          firstName: emp.firstName,
          lastName: emp.lastName,
          role: emp.role,
          status: 'ACTIVE',
        },
      });
    }

    if (employeeId) {
      await prisma.employeeSalaryConfig.upsert({
        where: { employeeId },
        update: {
          baseSalary: emp.baseSalary,
          currency: 'PHP',
          payPeriod: 'MONTHLY',
          hourlyRate: emp.baseSalary / 160,
        },
        create: {
          employeeId,
          baseSalary: emp.baseSalary,
          currency: 'PHP',
          payPeriod: 'MONTHLY',
          hourlyRate: emp.baseSalary / 160,
        },
      });
    }
  }

  console.log('✅ Realistic Filipino employees & salaries seeded');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
