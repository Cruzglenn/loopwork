import path from 'path';
import { type NextRequest } from 'next/server';
import { hrisApi } from '@/api/hris';
import { API_ERROR_MESSAGES, ApiError, VIEWABLE_FILE_EXTENSIONS, encodeFilenameForHeader } from '@/shared';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.csv': 'text/csv',
  '.txt': 'text/plain',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = hrisApi;

  const document = await api.documents.getDocumentById(id);

  if (!document) {
    throw new ApiError(404, API_ERROR_MESSAGES.DOCUMENTS.NOT_FOUND(id));
  }

  const ext = path.extname(document.filePath).toLowerCase();
  const fileName = document.filePath.split('/').pop();

  // Convert database path format (/uploads/...) to actual filesystem path (_uploads/...)
  const actualFilePath = document.filePath.startsWith('supabase://')
    ? document.filePath
    : document.filePath.replace(/^\/uploads\//, '_uploads/');
  const buffer = await api.documents.getFile('supabase-storage', actualFilePath);

  if (!buffer) {
    throw new ApiError(404, 'File not found');
  }

  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isViewable = VIEWABLE_FILE_EXTENSIONS.has(ext);

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `${isViewable ? 'inline' : 'attachment'}; ${encodeFilenameForHeader(fileName)}`,
    },
  });
}
