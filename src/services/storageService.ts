import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { uploadMediaFile as uploadToServerFallback } from './apiService';
import { compressImageFile } from '../utils/imageCompressor';

export interface UploadResult {
  url: string;
  storagePath?: string;
  fileName: string;
  mediaType: 'image' | 'video';
  size: number;
  compressedSize?: number;
  provider: 'firebase' | 'server';
}

/**
 * Uploads a file (with optional lightweight image compression) to Firebase Storage
 * with automatic fallback to server storage if needed.
 */
export async function uploadMediaToStorage(
  file: File,
  childId: string,
  onProgress?: (percent: number, statusText?: string) => void
): Promise<UploadResult> {
  const isVideo = file.type.startsWith('video/');
  const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

  // 1. Lightweight client-side compression for high-res images
  let fileToUpload = file;
  let originalSize = file.size;
  let compressedSize: number | undefined;

  if (!isVideo) {
    onProgress?.(5, 'Mengompresi foto...');
    try {
      const comp = await compressImageFile(file);
      fileToUpload = comp.file;
      originalSize = comp.originalSize;
      compressedSize = comp.compressedSize;
    } catch (e) {
      console.warn('Kompresi dilewati, mengunggah berkas asli:', e);
    }
  }

  // 2. Try Firebase Storage upload first
  try {
    onProgress?.(15, 'Menghubungkan ke Firebase Storage...');
    const timestamp = Date.now();
    const cleanName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `memories/${childId || 'general'}/${timestamp}_${cleanName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
      contentType: fileToUpload.type,
      customMetadata: {
        childId,
        uploadedAt: new Date().toISOString(),
        originalSize: String(originalSize),
      },
    });

    return await new Promise<UploadResult>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 80) + 15;
          const statusText = `Mengunggah ke Firebase Storage (${Math.min(progress, 95)}%)...`;
          onProgress?.(Math.min(progress, 95), statusText);
        },
        async (error) => {
          console.warn('Firebase Storage upload gagal, mencoba server fallback:', error);
          // Fallback to local server API
          try {
            onProgress?.(50, 'Beralih ke server backup...');
            const fallbackRes = await uploadToServerFallback(fileToUpload, (p) => {
              onProgress?.(50 + Math.round(p * 0.45), `Mengunggah ke server (${p}%)...`);
            });
            onProgress?.(100, 'Selesai diunggah!');
            resolve({
              url: fallbackRes.url,
              fileName: fallbackRes.fileName,
              mediaType,
              size: fileToUpload.size,
              compressedSize,
              provider: 'server',
            });
          } catch (serverErr) {
            reject(new Error(`Gagal mengunggah berkas: ${error.message}`));
          }
        },
        async () => {
          onProgress?.(98, 'Memproses URL unduhan...');
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.(100, 'Unggahan berhasil!');
            resolve({
              url: downloadUrl,
              storagePath,
              fileName: cleanName,
              mediaType,
              size: fileToUpload.size,
              compressedSize,
              provider: 'firebase',
            });
          } catch (urlErr: any) {
            reject(urlErr);
          }
        }
      );
    });
  } catch (err: any) {
    console.warn('Inisialisasi Firebase Storage gagal, beralih ke server:', err);
    // Server fallback
    const fallbackRes = await uploadToServerFallback(fileToUpload, (p) => {
      onProgress?.(p, `Mengunggah (${p}%)...`);
    });
    return {
      url: fallbackRes.url,
      fileName: fallbackRes.fileName,
      mediaType,
      size: fileToUpload.size,
      compressedSize,
      provider: 'server',
    };
  }
}

/**
 * Deletes a file from Firebase Storage
 */
export async function deleteMediaFromStorage(storagePath?: string): Promise<boolean> {
  if (!storagePath) return false;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    return true;
  } catch (err) {
    console.warn('Gagal menghapus berkas dari Firebase Storage:', err);
    return false;
  }
}
