import { extname } from 'path';
import { type NextRequest } from 'next/server';
import { prisma } from '@/api/hris/prisma/client';
import { supabaseStorageService } from '@/shared/service/file-persistance/file-persistence/supabase-storage.service';
import { encodeFilenameForHeader } from '@/shared';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ photoId: string }> | { photoId: string } },
) {
  const searchParams = request.nextUrl.searchParams;
  const download = searchParams.get('download') !== '0';

  try {
    const resolvedParams = await params;
    const photoId = resolvedParams.photoId;

    console.log('[DEBUG /api/company/photos] Requested photoId:', photoId, 'download:', download);

    let photo = await prisma.companyLogo.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      photo = await prisma.companyLogo.findFirst();
    }

    console.log('[DEBUG /api/company/photos] Found photo DB record:', photo);

    if (!photo) {
      console.log('[DEBUG /api/company/photos] No photo record found in DB');
      return new Response('Photo not found', { status: 404 });
    }

    const storage = supabaseStorageService();
    const actualFilePath = photo.filePath.startsWith('supabase://')
      ? photo.filePath
      : photo.filePath.replace(/^\/uploads\//, '_uploads/');

    console.log('[DEBUG /api/company/photos] Fetching file path from storage:', actualFilePath);
    const buffer = await storage.getFile(actualFilePath);

    if (!buffer) {
      console.log('[DEBUG /api/company/photos] Buffer is null for file path:', actualFilePath);
      return new Response('Photo not found', { status: 404 });
    }

    console.log('[DEBUG /api/company/photos] Successfully fetched buffer size:', buffer.length);

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
  } catch (err) {
    console.error('[DEBUG /api/company/photos] Error in GET route:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
