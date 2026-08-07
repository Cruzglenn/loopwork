/**
 * Utility to compress images (PNG, JPG, JPEG, WEBP) to optimized WebP format client-side
 * before submitting to server actions or upload endpoints.
 */
export async function compressImageToWebP(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.85,
): Promise<File> {
  // Return original file if it is an SVG or not a standard image
  if (file.type === 'image/svg+xml' || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new globalThis.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const compressedFile = new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
