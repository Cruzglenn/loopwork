import { getTranslations } from '@/shared/service/locale/get-translations';
import { Card } from '@/lib/ui';
import { BasicHeader } from '@/lib/ui/components/basic-header';
import { type CUID } from '@/shared';
import { hrisApi } from '@/api/hris';
import { RequestAbsenceForm } from './_form/request-absence.form';

export default async function RequestAbsencePage(props: { params: Promise<{ id: CUID }> }) {
  const { id } = await props.params;
  const api = hrisApi;
  const t = await getTranslations('absences.request');

  const me = await api.auth.getMe();

  return (
    <Card>
      <BasicHeader className="pb-2">{t('header')}</BasicHeader>
      <p className="pb-6 text-sm text-gray-500">
        Submit a leave request for manager review and approval (Pending Approval).
      </p>
      <RequestAbsenceForm dateFormat={me.dateFormat} employeeId={id} />
    </Card>
  );
}
