import { readFile, readdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';
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

const avatarCache = new Map<string, string | null>();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const download = searchParams.get('download') !== '0';
  const dir = searchParams.get('dir');

  console.log('[DEBUG /api/photos] Requested id:', id, 'dir:', dir, 'download:', download);

  try {
    let buffer: Buffer | null = null;
    let fileName: string | undefined;

    if (dir === 'employee') {
      const avatarId = id;
      const mediaDir = '_uploads/media';

      let filePath: string | null = avatarCache.get(avatarId) ?? null;

      if (filePath === null && !avatarCache.has(avatarId)) {
        const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
        let found = false;

        for (const ext of extensions) {
          const possiblePaths = [join(mediaDir, `${avatarId}${ext}`), join(mediaDir, ` ${avatarId}${ext}`)];

          for (const path of possiblePaths) {
            if (existsSync(path)) {
              filePath = path;
              fileName = `${avatarId}${ext}`;
              found = true;
              break;
            }
          }

          if (found) break;
        }

        if (!found) {
          try {
            const files = await readdir(mediaDir);
            const matchingFile = files.find((file) => file.startsWith(avatarId));

            if (matchingFile) {
              filePath = join(mediaDir, matchingFile);
              fileName = matchingFile;
            } else {
              filePath = null;
            }
          } catch (err) {
            console.error('Error reading media directory:', err);
            filePath = null;
          }
        }

        avatarCache.set(avatarId, filePath);
      }

      if (filePath) {
        buffer = await readFile(filePath);
        if (!fileName) {
          fileName = filePath.split('/').pop();
        }
      } else {
        const document = await prisma.document.findUnique({ where: { id: avatarId } });

        if (document) {
          const storage = supabaseStorageService();
          const actualFilePath = document.filePath.startsWith('supabase://')
            ? document.filePath
            : document.filePath.replace(/^\/uploads\//, '_uploads/');
          buffer = await storage.getFile(actualFilePath);
          fileName = document.filePath.split('/').pop();
        }
      }
    } else {
      // Company logo lookup
      let photo = await prisma.companyLogo.findUnique({ where: { id } });

      if (!photo) {
        photo = await prisma.companyLogo.findFirst();
      }

      console.log('[DEBUG /api/photos] Found company logo record:', photo);

      if (photo) {
        const storage = supabaseStorageService();
        const actualFilePath = photo.filePath.startsWith('supabase://')
          ? photo.filePath
          : photo.filePath.replace(/^\/uploads\//, '_uploads/');
        console.log('[DEBUG /api/photos] Fetching logo from storage:', actualFilePath);
        buffer = await storage.getFile(actualFilePath);
        fileName = photo.filePath.split('/').pop();
      }
    }

    if (buffer) {
      console.log('[DEBUG /api/photos] Buffer size:', buffer.length);
      const ext = extname(fileName ?? '').toLowerCase();
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

    console.log('[DEBUG /api/photos] Returning 404 - buffer is null');
    return new Response(null, { status: 404 });
  } catch (error) {
    console.error('[DEBUG /api/photos] Error serving photo:', error);
    return new Response(null, { status: 404 });
  }
}
