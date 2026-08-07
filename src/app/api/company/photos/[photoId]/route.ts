import { extname } from 'path';
import { type NextRequest } from 'next/server';
import { hrisApi } from '@/api/hris';
import { encodeFilenameForHeader } from '@/shared';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const download = searchParams.get('download') !== '0'; // 0 - view 1 - download;

  const api = hrisApi;
  const photo = await api.company.getCompanyLogo();

  if (!photo) return new Response('Photo not found', { status: 404 });

  const actualFilePath = photo.filePath.startsWith('supabase://')
    ? photo.filePath
    : photo.filePath.replace(/^\/uploads\//, '_uploads/');

  const buffer = await api.documents.getFile('supabase-storage', actualFilePath);

  if (!buffer) {
    return new Response('Photo not found', { status: 404 });
  }

  const fileName = photo.filePath.split('/').pop() || 'photo';
  const ext = extname(fileName).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? 'image/png';

  if (download) {
    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Disposition': `attachment; ${encodeFilenameForHeader(fileName)}`,
        'Content-Type': contentType,
      },
    });
  }

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
