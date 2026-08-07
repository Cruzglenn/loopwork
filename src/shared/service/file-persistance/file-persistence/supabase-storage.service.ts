import { type CUID } from '@/shared';
import { type FileUpload, type ErrorCallback } from '@/api/hris/documents/model/service/file-upload.type';
import { logger } from '@/shared/service/pino';
import { persistentVolumeService } from './persistent-volume.service';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export function supabaseStorageService(): FileUpload {
  const fallback = persistentVolumeService();

  const getBucketAndPath = (dirPath: string, organizationId: CUID, fileName: string) => {
    const bucket = dirPath === 'photos' || dirPath.includes('photos') ? 'photos' : 'documents';
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const objectPath = `${organizationId}/${cleanFileName}`;
    return { bucket, objectPath };
  };

  const uploadFile = async (
    organizationId: CUID,
    file: File,
    dirPath: string = 'photos',
    onError?: ErrorCallback,
  ) => {
    try {
      const fileName = file.name || `${Date.now()}-file`;
      const { bucket, objectPath } = getBucketAndPath(dirPath, organizationId, fileName);

      const fileBuffer = await file.arrayBuffer();
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          'x-upsert': 'true',
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: fileBuffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ errorText, status: response.status }, 'Supabase Storage upload failed');
        // Fallback to persistent volume if Supabase fails
        return fallback.uploadFile(organizationId, file, dirPath, onError);
      }

      // Return path identifier formatted for DutyDuke document DB records
      return `supabase://${bucket}/${objectPath}`;
    } catch (err) {
      logger.error({ err }, 'Supabase Storage upload error');
      return fallback.uploadFile(organizationId, file, dirPath, onError);
    }
  };

  const uploadBuffer = async (
    organizationId: CUID,
    fileName: string,
    buffer: Buffer,
    dirPath: string = 'photos',
    onError?: ErrorCallback,
  ) => {
    try {
      const { bucket, objectPath } = getBucketAndPath(dirPath, organizationId, fileName);
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
          'x-upsert': 'true',
          'Content-Type': 'application/octet-stream',
        },
        body: new Uint8Array(buffer),
      });

      if (!response.ok) {
        return fallback.uploadBuffer(organizationId, fileName, buffer, dirPath, onError);
      }

      return `supabase://${bucket}/${objectPath}`;
    } catch (err) {
      logger.error({ err }, 'Supabase Storage uploadBuffer error');
      return fallback.uploadBuffer(organizationId, fileName, buffer, dirPath, onError);
    }
  };

  const getFile = async (filePath: string, onError?: ErrorCallback): Promise<Buffer | null> => {
    try {
      if (filePath.startsWith('supabase://')) {
        const pathWithoutPrefix = filePath.replace('supabase://', '');
        const firstSlash = pathWithoutPrefix.indexOf('/');
        const bucket = pathWithoutPrefix.substring(0, firstSlash);
        const objectPath = pathWithoutPrefix.substring(firstSlash + 1);

        const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${objectPath}`;
        const response = await fetch(fileUrl, {
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
        });

        if (!response.ok) {
          return fallback.getFile(filePath, onError);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      return fallback.getFile(filePath, onError);
    } catch (err) {
      logger.error({ err }, 'Supabase Storage getFile error');
      return fallback.getFile(filePath, onError);
    }
  };

  const deleteFileByFilePath = async (filePath: string, onError?: ErrorCallback) => {
    try {
      if (filePath.startsWith('supabase://')) {
        const pathWithoutPrefix = filePath.replace('supabase://', '');
        const firstSlash = pathWithoutPrefix.indexOf('/');
        const bucket = pathWithoutPrefix.substring(0, firstSlash);
        const objectPath = pathWithoutPrefix.substring(firstSlash + 1);

        const deleteUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${objectPath}`;
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            apikey: SUPABASE_ANON_KEY,
          },
        });

        return response.ok;
      }

      return fallback.deleteFileByFilePath(filePath, onError);
    } catch (err) {
      logger.error({ err }, 'Supabase Storage deleteFile error');
      return fallback.deleteFileByFilePath(filePath, onError);
    }
  };

  return {
    init: fallback.init,
    uploadFile,
    uploadBuffer,
    deleteFile: fallback.deleteFile,
    deleteDirectory: fallback.deleteDirectory,
    deleteFileByFilePath,
    getFile,
    getAllFileNames: fallback.getAllFileNames,
  };
}
