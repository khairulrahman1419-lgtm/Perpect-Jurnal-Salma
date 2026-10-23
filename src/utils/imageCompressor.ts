/**
 * Client-side lightweight image compressor
 * Downscales oversized camera photos to an optimized web format before uploading to Firebase Storage.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  const originalSize = file.size;

  // If not an image (e.g. video) or already tiny (< 250KB), return as is
  if (!file.type.startsWith('image/') || file.size <= 250 * 1024) {
    return { file, originalSize, compressedSize: originalSize };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

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
          return resolve({ file, originalSize, compressedSize: originalSize });
        }

        // High quality bicubic resampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed is somehow larger than original, keep original
              return resolve({ file, originalSize, compressedSize: originalSize });
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize: compressedFile.size,
            });
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        resolve({ file, originalSize, compressedSize: originalSize });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ file, originalSize, compressedSize: originalSize });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Downloads a media file directly to user device (mobile or desktop)
 */
export async function downloadMediaFile(mediaUrl: string, fileName: string): Promise<boolean> {
  try {
    // If it's a blob or data url or same-origin
    if (mediaUrl.startsWith('data:') || mediaUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return true;
    }

    // Try fetching the file as blob to force browser download dialog
    const res = await fetch(mediaUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('Fetch failed');
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(objectUrl);
    return true;
  } catch (err) {
    console.warn('Direct blob download failed, attempting window fallback:', err);
    // Fallback: trigger link with download attribute or open
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  }
}
