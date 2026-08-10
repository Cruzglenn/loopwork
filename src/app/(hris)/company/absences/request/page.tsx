import { getTranslations } from '@/shared/service/locale/get-translations';
import { Avatar, Card } from '@/lib/ui';
import { BasicHeader } from '@/lib/ui/components/basic-header';
import { hrisApi } from '@/api/hris';
import { type Item } from '@/lib/ui/components/combo-box/types';
import { RequestAbsenceForm } from './_form/request-absence.form';

export default async function RequestAbsencePage() {
  const t = await getTranslations('absences.request');

  const api = hrisApi;

  const [employees, me] = await Promise.all([api.employees.getAllEmployees(), api.auth.getMe()]);

  const employeeList: Item[] = employees.map((employee) => ({
    key: employee.id,
    textValue: `${employee.firstName} ${employee.lastName}`,
    label: (
      <div className="flex items-center gap-x-2">
        <Avatar avatarId={employee.avatarId} size="xs" />
        <div>
          {employee.firstName} {employee.lastName}
        </div>
      </div>
    ),
  }));

  return (
    <Card>
      <BasicHeader className="pb-2">{t('header')}</BasicHeader>
      <p className="pb-6 text-sm text-gray-500">
        Directly log pre-approved leave or holiday for an employee (Admin Direct Allocation).
      </p>
      <RequestAbsenceForm dateFormat={me.dateFormat} employees={employeeList} />
    </Card>
  );
}
