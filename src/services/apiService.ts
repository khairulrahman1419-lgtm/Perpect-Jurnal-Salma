import { ChildMemory, ChildProfile, GrowthRecord } from '../types';

/**
 * Uploads a real file (image or video up to 100MB) to the online server
 */
export async function uploadMediaFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; fileName: string; mediaType: 'image' | 'video' }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.open('POST', '/api/upload');

    // Track upload progress for large videos and high-res photos
    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.url,
            fileName: res.fileName,
            mediaType: res.mediaType,
          });
        } catch (e) {
          reject(new Error('Gagal memproses respon server'));
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          reject(new Error(res.error || `Gagal mengunggah berkas (${xhr.status})`));
        } catch {
          reject(new Error(`Gagal mengunggah berkas (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Koneksi terputus saat mengunggah berkas. Periksa jaringan Anda.'));
    };

    xhr.send(formData);
  });
}

/**
 * Loads entire database from server for real-time sync across devices
 */
export async function fetchOnlineDatabase(): Promise<{
  child?: ChildProfile | null;
  growthRecords?: GrowthRecord[];
  memories?: ChildMemory[];
} | null> {
  try {
    const res = await fetch('/api/database');
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Gagal memuat database online, beralih ke cache lokal:', err);
    return null;
  }
}

/**
 * Saves a memory to the online database
 */
export async function saveOnlineMemory(memory: ChildMemory): Promise<boolean> {
  try {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memory),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menyimpan memori online:', err);
    return false;
  }
}

/**
 * Deletes a memory from the online database
 */
export async function deleteOnlineMemory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/memories/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menghapus memori online:', err);
    return false;
  }
}

/**
 * Updates child profile in the online database
 */
export async function saveOnlineChild(child: ChildProfile): Promise<boolean> {
  try {
    const res = await fetch('/api/child', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(child),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menyimpan profil anak online:', err);
    return false;
  }
}

/**
 * Saves a growth record in the online database
 */
export async function saveOnlineGrowthRecord(record: GrowthRecord): Promise<boolean> {
  try {
    const res = await fetch('/api/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menyimpan antropometri online:', err);
    return false;
  }
}

/**
 * Deletes a growth record from the online database
 */
export async function deleteOnlineGrowthRecord(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/growth/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menghapus antropometri online:', err);
    return false;
  }
}

