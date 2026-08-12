'use client';

import { useActionState, useRef } from 'react';
import { useTranslations } from '@/shared/service/locale/use-translations';
import { Button, FormControl, DocumentUploadErrorBar } from '@/lib/ui';
import { uploadEmployeeDocument } from '../_actions';

type Props = {
  employeeId: string;
};

export function UploadEmployeeDocumentForm({ employeeId }: Props) {
  const [state, uploadEmployeeDocumentAction] = useActionState(uploadEmployeeDocument, {
    status: 'idle',
    form: { employeeId, file: '' },
  });

  const t = useTranslations('employees.documents');

  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form noValidate action={uploadEmployeeDocumentAction} id="uploadEmployeeDocumentForm" ref={formRef}>
        <input
          multiple
          className="hidden"
          name="document"
          ref={inputRef}
          type="file"
          onChange={() => formRef.current?.requestSubmit()}
        />
        <FormControl>
          {({ isSubmitting }) => (
            <Button
              icon="upload"
              iconPlacement="right"
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
              type="button"
              onClick={() => inputRef.current?.click()}
            >
              {t('addFile')}
            </Button>
          )}
        </FormControl>
      </form>
      <DocumentUploadErrorBar formStatus={state} />
    </>
  );
}
