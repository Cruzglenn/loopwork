'use client';

import { useTranslations } from 'use-intl';
import { SearchInput } from '@/lib/ui';
import { FilterTag } from '@/lib/ui/components/filter-tag';
import { Stack } from '@/lib/ui/components/stack';

export function AttendanceFilters(): JSX.Element {
  const t = useTranslations();

  return (
    <Stack className="w-full flex-wrap justify-between" gapY="md">
      <SearchInput className="w-full max-w-sm" />
      <Stack gapX="sm">
        <FilterTag searchParamKey="STATUS" value="CLOCKED_IN" variant="green">
          {t('attendance.status.clockedIn')}
        </FilterTag>
        <FilterTag searchParamKey="STATUS" value="ON_BREAK" variant="orange">
          {t('attendance.status.onBreak')}
        </FilterTag>
        <FilterTag searchParamKey="STATUS" value="CLOCKED_OUT" variant="gray">
          {t('attendance.status.clockedOut')}
        </FilterTag>
      </Stack>
    </Stack>
  );
}
