import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider as provider } from './firebase';

export { auth };

// Desired Google Drive scopes
export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google to grant Google Drive file access
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign in error:', error);
    let friendlyMessage = error.message || 'Gagal menghubungkan Google Drive';
    if (error.code === 'auth/popup-blocked') {
      friendlyMessage = 'Jendela login Google diblokir oleh peramban ponsel. Silakan izinkan pop-up di browser Anda.';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'Domain aplikasi ini sedang proses otorisasi. Mohon coba beberapa saat lagi.';
    } else if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Jendela login Google ditutup sebelum otorisasi selesai.';
    }
    const err = new Error(friendlyMessage);
    (err as any).code = error.code;
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Creates or gets the dedicated "TumbuhKembang - Jurnal Buah Hati" folder in Google Drive
 */
export async function getOrCreateAppFolder(accessToken: string): Promise<string | null> {
  try {
    // Search for existing folder created by this app
    const q = "name = 'TumbuhKembang - Jurnal Buah Hati' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }
    }

    // Create folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'TumbuhKembang - Jurnal Buah Hati',
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Folder penyimpanan otomatis foto & video kenangan tumbuh kembang anak',
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      return folderData.id || null;
    }
    return null;
  } catch (err) {
    console.warn('Notice when checking/creating Drive folder, will upload to root if needed:', err);
    return null;
  }
}

export interface DriveUploadResult {
  fileId: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
  directUrl: string;
  downloadUrl: string;
}

/**
 * Uploads a photo or video directly to Google Drive using multipart upload
 */
export async function uploadMediaToGoogleDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  fileOrBlobOrUrl: File | Blob | string,
  childName: string,
  onProgress?: (stage: string) => void
): Promise<DriveUploadResult | null> {
  try {
    onProgress?.('Mencari folder Google Drive...');
    const folderId = await getOrCreateAppFolder(accessToken);

    // Convert input to binary Blob
    let blob: Blob;
    let finalMimeType = mimeType;

    if (fileOrBlobOrUrl instanceof Blob) {
      blob = fileOrBlobOrUrl;
      finalMimeType = fileOrBlobOrUrl.type || mimeType || 'application/octet-stream';
    } else if (typeof fileOrBlobOrUrl === 'string' && fileOrBlobOrUrl.startsWith('data:')) {
      const parts = fileOrBlobOrUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      blob = new Blob([uInt8Array], { type: contentType });
      finalMimeType = contentType;
    } else if (typeof fileOrBlobOrUrl === 'string') {
      const response = await fetch(fileOrBlobOrUrl);
      blob = await response.blob();
      finalMimeType = blob.type || mimeType;
    } else {
      throw new Error('Format berkas tidak didukung');
    }

    onProgress?.('Mengunggah media ke Google Drive...');

    // Prepare metadata
    const sanitizedChildName = (childName || 'Anak').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const safeFileName = `${sanitizedChildName}_${fileName}`;
    const metadata = {
      name: safeFileName,
      mimeType: finalMimeType,
      parents: folderId ? [folderId] : undefined,
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', blob);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: form,
      }
    );

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      console.error('Failed to upload to Google Drive:', errBody);
      throw new Error(`Google Drive upload failed: ${uploadRes.status} ${uploadRes.statusText}`);
    }

    const uploaded = await uploadRes.json();
    const fileId = uploaded.id;

    // Grant read permission to anyone with the link so thumbnail/download works smoothly
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });
    } catch (permErr) {
      console.warn('Could not set public permission on Drive file:', permErr);
    }

    // Direct image display URL via Google thumbnail service
    const isImage = finalMimeType.startsWith('image/');
    const directUrl = isImage
      ? `https://lh3.googleusercontent.com/d/${fileId}=s1600`
      : `https://drive.google.com/uc?id=${fileId}&export=download`;

    const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
    const webViewLink = uploaded.webViewLink || `https://drive.google.com/file/d/${fileId}/view`;

    return {
      fileId,
      name: uploaded.name || safeFileName,
      webViewLink,
      webContentLink: uploaded.webContentLink || downloadUrl,
      directUrl,
      downloadUrl,
    };
  } catch (err) {
    console.error('Error uploading media to Drive:', err);
    throw err;
  }
}

/**
 * Delete a media file from Google Drive (Requires user confirmation prior to call)
 */
export async function deleteMediaFromGoogleDrive(
  accessToken: string,
  fileId: string
): Promise<boolean> {
  try {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok;
  } catch (err) {
    console.error('Error deleting file from Drive:', err);
    return false;
  }
}
