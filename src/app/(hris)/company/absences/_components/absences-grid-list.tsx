'use client';

import { useTranslations as useNextTranslations } from 'next-intl';
import Link from 'next/link';
import { useTranslations } from '@/shared/service/locale/use-translations';
import { type AbsenceDTO, type AbsenceAction } from '@/api/hris/absences/model/dtos/absence.dto';
import { type BaseEmployeeDto } from '@/api/hris/employees/model/dtos';
import { BottomSheet, Button, GridList, GridListHeader, GridListItem } from '@/lib/ui';
import { useModal } from '@/lib/ui/hooks';
import {
  type WithAccess,
  type Paginated,
  type OrderBy,
  parseDate,
  cn,
  type PropsWithClassName,
  HRIS_ROUTES,
  type CUID,
} from '@/shared';
import { useSelectItems } from '@/lib/ui/hooks/useSelectItems';
import { AbsencesMenu } from './absences-menu';
import { AbsencesFiltersStatus, AbsencesFiltersType } from './absences-filters';

type AbsenceItem = Pick<
  AbsenceDTO,
  'id' | 'requestedAt' | 'type' | 'status' | 'rejectedAt' | 'approvedAt' | 'description'
> & {
  dateRange: string;
  issuer: BaseEmployeeDto | null;
};

type Props = {
  absences: WithAccess<Paginated<AbsenceItem>, { actions: AbsenceAction[] }>;
  reviewerId: CUID;
  disableActions?: boolean;
  selectionMode?: 'multiple' | 'single' | 'none';
  dateFormat: string;
};

const SORT_KEYS = [
  { key: 'requestedAt-asc' },
  { key: 'requestedAt-desc' },
  { key: 'type-asc' },
  { key: 'type-desc' },
] as Array<{ key: OrderBy }>;

export function AbsencesGridList({
  absences,
  className,
  reviewerId,
  disableActions = false,
  selectionMode = 'multiple',
  dateFormat,
}: PropsWithClassName<Props>) {
  const { isOpen, openModal, closeModal, setIsOpen } = useModal();
  const { selectedItems } = useSelectItems('ABSENCES');
  const t = useTranslations('absences');
  const tNext = useNextTranslations('absences');
  const {
    items,
    _access: { actions },
  } = absences;

  return (
    <>
      <GridListHeader
        className={cn(className)}
        searchParamKey="ABSENCES"
        selectionMode={actions.includes('select') ? selectionMode : undefined}
        sortKeys={disableActions ? undefined : SORT_KEYS}
      >
        {!disableActions && actions.includes('filter') && (
          <Button className="mr-auto" icon="filter" intent="tertiary" onClick={openModal} />
        )}
        {actions.includes('approve') && actions.includes('reject') && selectedItems.length > 0 && (
          <AbsencesMenu
            isBulkAction
            absenceId={selectedItems}
            actions={actions}
            reviewerId={reviewerId}
            variant="large"
          />
        )}
        {!disableActions && actions.includes('create') && !selectedItems.length && (
          <Link aria-label={tNext('add')} href={HRIS_ROUTES.company.absences.request}>
            <Button icon="add" intent="primary" />
          </Link>
        )}
      </GridListHeader>
      <GridList
        aria-label={tNext('header')}
        className={cn(className)}
        searchParamKey="ABSENCES"
        selectionMode={actions.includes('select') ? selectionMode : undefined}
      >
        {items.map((absence, index) => (
          <GridListItem
            key={absence.id}
            className={cn(
              'flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-divider py-3 text-sm min-w-0',
              {
                'border-y': index === 0,
              },
            )}
            href={absence.issuer ? HRIS_ROUTES.employees.absence.base(absence.issuer.id) : undefined}
            id={absence.id}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-gray-900">
                  {absence.issuer ? `${absence.issuer.lastName} ${absence.issuer.firstName}` : '—'}
                </span>
                <span
                  className={cn('text-[0.65rem] font-medium px-1.5 py-0.5 rounded shrink-0', {
                    'bg-orange-100 text-orange-800': absence.status === 'PENDING',
                    'bg-green-100 text-green-800': absence.status === 'APPROVED',
                    'bg-red-100 text-red-900': absence.status === 'REJECTED',
                  })}
                >
                  {t(`status.${absence.status.toLowerCase()}`)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                <span
                  className={cn('font-medium shrink-0', {
                    'text-orange-800': absence.type === 'SICK',
                    'text-green-800': absence.type === 'HOLIDAY',
                    'text-blue-800': absence.type === 'PERSONAL',
                  })}
                >
                  {t(`type.${absence.type.toLowerCase()}`)}
                </span>
                <span>•</span>
                <span className="truncate">{absence.dateRange}</span>
              </div>
              {absence.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{absence.description}</p>
              )}
            </div>
            <div className="shrink-0 self-center">
              <AbsencesMenu
                absenceId={[absence.id]}
                actions={actions}
                approvedAt={absence.approvedAt}
                rejectedAt={absence.rejectedAt}
                reviewerId={reviewerId}
                status={absence.status}
              />
            </div>
          </GridListItem>
        ))}
      </GridList>
      <BottomSheet isOpen={isOpen} label={t('filters.label')} onClose={closeModal} onOpenChange={setIsOpen}>
        <div className="flex flex-col gap-y-8">
          <AbsencesFiltersStatus className="flex-col items-start" />
          <AbsencesFiltersType className="flex-col items-start" />
        </div>
      </BottomSheet>
    </>
  );
}
