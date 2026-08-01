'use client';

import { useTransition } from 'react';
import { useTranslations } from 'use-intl';
import { Button } from '@/lib/ui';
import { generatePayrollRunAction } from '../_actions/generate-payroll.action';

export function GeneratePayrollButton(): JSX.Element {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]!;
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]!;

    const formData = new FormData();
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('notes', 'Monthly Payroll Run');

    startTransition(async () => {
      await generatePayrollRunAction(formData);
    });
  };

  return (
    <Button intent="primary" isLoading={isPending} onClick={handleGenerate}>
      {t('payroll.generate')}
    </Button>
  );
}
