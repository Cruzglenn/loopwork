'use client';

import { ListBox, ListBoxItem } from 'react-aria-components';
import { useTranslations } from '@/shared/service/locale/use-translations';
import { Icon } from '@/lib/ui';
import { type FileData } from '@/shared/types/file';
import { type CUID } from '@/shared';

type Props = {
  data: FileData[];
  onDeleteFile: (id: CUID) => void;
};

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function FilesList({ data, onDeleteFile }: Props) {
  const t = useTranslations('labels');
  if (!data.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-gray-700">{t('filesList') || 'Selected Files'}:</p>
      <ListBox key={data.length} aria-label="List of uploaded files" items={data}>
        {(item) => (
          <ListBoxItem
            key={item.id}
            aria-label={`File ${item.file.name}`}
            className="mb-1.5 flex w-full items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/80 p-2.5 text-xs text-gray-800 transition-all hover:border-gray-300 hover:bg-gray-100"
            textValue={item.file.name}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-100 text-[10px] font-semibold uppercase text-blue-700">
                {item.file.name.split('.').pop() || 'FILE'}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-gray-900">{item.file.name}</span>
                <span className="text-[11px] text-gray-500">{formatBytes(item.file.size)}</span>
              </div>
            </div>
            <button
              aria-label="Remove file"
              className="flex size-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              type="button"
              onClick={() => onDeleteFile(item.id)}
            >
              <Icon name="trash" size="xs" />
            </button>
          </ListBoxItem>
        )}
      </ListBox>
    </div>
  );
}
