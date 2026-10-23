import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider as provider } from './firebase';

export { auth };

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
        // Try to re-authenticate or prompt login
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

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
      friendlyMessage = 'Jendela popup Google diblokir oleh peramban HP Anda. Izinkan pop-up di setelan peramban untuk menghubungkan Google Drive.';
    } else if (error.code === 'auth/unauthorized-domain') {
      friendlyMessage = 'Domain aplikasi ini belum terdaftar di Firebase Authorized Domains. Jangan khawatir, foto dan video Anda otomatis disimpan aman di Cloud Storage server kami!';
    } else if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Jendela login Google ditutup sebelum selesai.';
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
    // Search for existing folder
    const q = "name = 'TumbuhKembang - Jurnal Buah Hati' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
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
      }),
    });
    const folderData = await createRes.json();
    return folderData.id || null;
  } catch (err) {
    console.error('Error finding/creating folder in Drive:', err);
    return null;
  }
}

/**
 * Uploads a base64 / blob media file directly to Google Drive
 */
export async function uploadMediaToGoogleDrive(
  accessToken: string,
  fileName: string,
  mimeType: string,
  base64OrBlobUrl: string,
  childName: string
): Promise<{ fileId: string; webViewLink?: string } | null> {
  try {
    const folderId = await getOrCreateAppFolder(accessToken);

    // Convert base64 / data URL to binary blob
    let blob: Blob;
    if (base64OrBlobUrl.startsWith('data:')) {
      const parts = base64OrBlobUrl.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      blob = new Blob([uInt8Array], { type: contentType });
    } else {
      const response = await fetch(base64OrBlobUrl);
      blob = await response.blob();
    }

    // Construct multipart upload body
    const metadata = {
      name: `${childName}_${fileName}`,
      mimeType: mimeType || blob.type || 'image/jpeg',
      parents: folderId ? [folderId] : undefined,
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', blob);

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink',
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
      return null;
    }

    const uploaded = await uploadRes.json();
    return {
      fileId: uploaded.id,
      webViewLink: uploaded.webViewLink,
    };
  } catch (err) {
    console.error('Error uploading media to Drive:', err);
    return null;
  }
}
