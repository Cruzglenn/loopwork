'use client';

import { type ReactNode, useRef, useState } from 'react';
import { useTranslations as useNextTranslations } from 'next-intl';
import { PhotoUploadButton } from '@/lib/ui/components/photos-list';
import { Photo } from '@/lib/ui/components/photo';
import { cn, MAX_FILE_SIZE, compressImageToWebP } from '@/shared';
import { Label } from '@/lib/ui';

type Props = {
  defaultPhotoSrc?: string;
  label?: string | ReactNode;
  errorMessage?: string;
  onDelete?(): void;
} & React.ComponentProps<'input'>;

export function PhotoInput({ defaultPhotoSrc, label, id, errorMessage, name, onDelete, ...other }: Props) {
  const tNext = useNextTranslations('forms');
  const [uploadedPhoto, setUploadedPhoto] = useState<File | string | undefined>(defaultPhotoSrc);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = event.currentTarget.files?.[0];
    if (!rawFile) return;

    try {
      setIsCompressing(true);
      setFileError(null);

      // Auto-compress image to WebP client-side
      const file = await compressImageToWebP(rawFile);

      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File size must be under 4 MB (${(file.size / 1024 / 1024).toFixed(1)} MB selected)`);
        setUploadedPhoto(undefined);
        if (inputRef.current) {
          const dt = new DataTransfer();
          inputRef.current.files = dt.files;
        }
        return;
      }

      // Replace file input's files with the compressed WebP file so Form submits the WebP File
      if (inputRef.current) {
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
      }

      setUploadedPhoto(file);
    } catch {
      setUploadedPhoto(rawFile);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleDelete = () => {
    setUploadedPhoto(undefined);
    setFileError(null);
    if (inputRef.current) {
      // Clear file input using DataTransfer
      const dt = new DataTransfer();
      inputRef.current.files = dt.files;
    }
    onDelete?.();
  };

  const displayError = fileError || errorMessage;

  return (
    <div className="flex flex-col gap-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      {uploadedPhoto && (
        <>
          {typeof uploadedPhoto === 'string' && (
            <input defaultValue={id} id={id} name={name} type="hidden" {...other} />
          )}
          <Photo
            alt={tNext('photo') ?? ''}
            src={typeof uploadedPhoto === 'string' ? uploadedPhoto : URL.createObjectURL(uploadedPhoto)}
            onDelete={handleDelete}
          />
        </>
      )}
      <PhotoUploadButton
        className={cn({ hidden: !!uploadedPhoto || isCompressing })}
        name={name}
        ref={inputRef}
        onChange={handleUploadFile}
      />
      {isCompressing && <p className="animate-pulse text-xxs text-grey">Compressing image...</p>}
      {displayError && (
        <p aria-live="assertive" className="pt-1 text-xxs leading-[0.75rem] text-warning">
          {displayError}
        </p>
      )}
    </div>
  );
}
