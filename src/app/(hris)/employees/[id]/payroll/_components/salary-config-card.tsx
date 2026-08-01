'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'use-intl';
import { type EmployeeSalaryConfigDto } from '@/api/hris/payroll/model/dtos';
import { Button, Card, TextInput } from '@/lib/ui';
import { Stack } from '@/lib/ui/components/stack';
import { updateSalaryConfigAction } from '../_actions/salary-actions';

type Props = {
  employeeId: string;
  config: EmployeeSalaryConfigDto | null;
};

export function SalaryConfigCard({ employeeId, config }: Props): JSX.Element {
  const t = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [baseSalary, setBaseSalary] = useState(config?.baseSalary || 3000);

  const handleSave = () => {
    startTransition(async () => {
      await updateSalaryConfigAction(employeeId, Number(baseSalary));
    });
  };

  return (
    <Card className="flex flex-col gap-4 border border-gray-200 bg-gray-50/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Stack gapX="md">
          <div className="flex flex-col">
            <span className="text-lg font-bold">{t('payroll.salaryConfig')}</span>
            <span className="text-sm font-medium text-gray-500">
              Base rate & currency configuration for automated payslips
            </span>
          </div>
        </Stack>

        <Stack gapX="sm">
          <div className="flex items-center gap-2">
            <TextInput
              className="w-36"
              label={t('payroll.baseSalary')}
              type="number"
              value={baseSalary.toString()}
              onChange={(val) => setBaseSalary(Number(val))}
            />
            <Button className="mb-0.5 self-end" intent="primary" isLoading={isPending} onClick={handleSave}>
              Save
            </Button>
          </div>
        </Stack>
      </div>
    </Card>
  );
}
