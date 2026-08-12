'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { createId } from '@paralleldrive/cuid2';
import { useTranslations as useNextTranslations } from 'next-intl';
import { useTranslations } from '@/shared/service/locale/use-translations';
import { HRIS_ROUTES, type CUID } from '@/shared';
import { Button, ComboBox, DateField, Form, FormControl, Icon, TextInput } from '@/lib/ui';
import { type FileData } from '@/shared/types/file';
import { FilesList } from '../_components';
import { addDocument } from '../_actions';

type Props = {
  categories: { key: string; label: string }[];
  dateFormat: string;
};

export function AddFileForm({ categories, dateFormat }: Props): JSX.Element {
  const t = useTranslations('company.documents.add');
  const tNext = useNextTranslations('company.documents.add');
  const router = useRouter();

  const [files, setFiles] = useState<FileData[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const dataTransfer = useRef<DataTransfer | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dataTransfer.current = new DataTransfer();
  }, []);

  const addFiles = (attachedFiles: FileList | File[] | null) => {
    if (!inputRef.current || !attachedFiles || !dataTransfer.current) return;
    const filesArray = Array.from(attachedFiles);
    const filesToUpload: FileData[] = [];

    for (const file of filesArray) {
      dataTransfer.current.items.add(file);

      filesToUpload.push({
        id: `temp--${createId()}`,
        file,
      });
    }

    inputRef.current.files = dataTransfer.current.files;
    setFiles((prev) => [...prev, ...filesToUpload]);
  };

  const deleteFileFromList = (id: CUID) => {
    if (!inputRef.current || !dataTransfer.current) return;

    const fileToRemove = files.find((file) => file.id === id);
    if (!fileToRemove) return;

    const newDataTransfer = new DataTransfer();
    Array.from(dataTransfer.current.files).forEach((file) => {
      if (file !== fileToRemove.file) {
        newDataTransfer.items.add(file);
      }
    });

    dataTransfer.current = newDataTransfer;
    inputRef.current.files = newDataTransfer.files;

    setFiles(files.filter((file) => file.id !== id));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleSuccess = () => router.push(HRIS_ROUTES.documents.base);

  return (
    <div className="pt-4">
      <Form
        focusInputOnError
        action={addDocument}
        className="flex flex-1 flex-col gap-5"
        defaultState={{
          status: 'idle',
          form: {
            category: '',
            description: '',
            documents: [],
            expirationDate: '',
          },
        }}
        onSuccess={handleSuccess}
      >
        {(_, errors) => (
          <>
            {/* Category Dropdown */}
            <FormControl errors={errors} name="category">
              {(formState) => (
                <ComboBox
                  {...formState}
                  allowsCustomValue
                  className="w-full md:w-[calc(50%_-_0.5rem)]"
                  inputProps={{
                    placeholder: tNext('category') || 'Select or type a category',
                  }}
                  items={categories}
                  label={t('category') || 'Category'}
                />
              )}
            </FormControl>

            {/* Description & Expiration Date */}
            <div className="flex flex-col gap-4 md:flex-row">
              <FormControl name="description">
                {(formState) => (
                  <TextInput
                    {...formState}
                    className="w-full"
                    description={
                      files.length > 1
                        ? 'Description disabled for bulk file upload'
                        : t('infoDescription') || 'Defaults to file name if left empty'
                    }
                    inputProps={{
                      placeholder: 'e.g. Employee Contract 2026',
                    }}
                    isDisabled={files.length > 1}
                    label={t('description') || 'Description'}
                    name="description"
                  />
                )}
              </FormControl>

              <FormControl name="expirationDate">
                {(formState) => (
                  <DateField
                    {...formState}
                    className="w-full"
                    dateFormat={dateFormat}
                    label={t('expirationDate') || 'Expiration date'}
                    name="expirationDate"
                  />
                )}
              </FormControl>
            </div>

            {/* Hidden File Input */}
            <input
              multiple
              className="hidden"
              name="documents"
              ref={inputRef}
              type="file"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* Drag & Drop File Upload Box */}
            <div
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                isDragOver
                  ? 'scale-[0.99] border-blue-500 bg-blue-50/80 ring-4 ring-blue-100'
                  : 'border-gray-300 bg-gray-50/60 hover:border-blue-400 hover:bg-blue-50/30'
              }`}
              onClick={() => inputRef.current?.click()}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                <Icon name="upload" size="md" />
              </div>
              <div className="mt-3 text-sm font-semibold text-gray-800">
                Drag & drop your files here, or <span className="text-blue-600 underline">browse</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Supports PDF, PNG, JPG, WEBP, DOCX, XLSX (max 25MB per file)
              </p>
              <Button
                className="pointer-events-none mt-4"
                icon="upload"
                iconPlacement="right"
                intent="secondary"
                size="sm"
                type="button"
              >
                {t('addFiles') || 'Select files'}
              </Button>
            </div>

            {/* Attached Files List */}
            {files.length > 0 && (
              <div className="shadow-xs rounded-xl border border-gray-200 bg-white p-4">
                <FilesList data={files} onDeleteFile={deleteFileFromList} />
              </div>
            )}

            {/* Action Footer Buttons */}
            <FormControl>
              {({ isSubmitting }) => (
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <Button
                    intent="secondary"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                    type="button"
                    onClick={() => router.push(HRIS_ROUTES.documents.base)}
                  >
                    {t('cancel') || 'Cancel'}
                  </Button>
                  <Button
                    icon="ok"
                    intent="primary"
                    isDisabled={!files.length || isSubmitting}
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    {isSubmitting ? 'Uploading Documents...' : t('submit') || 'Submit Document'}
                  </Button>
                </div>
              )}
            </FormControl>
          </>
        )}
      </Form>
    </div>
  );
}
