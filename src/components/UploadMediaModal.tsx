import React, { useState, useRef, useEffect } from 'react';
import { ChildProfile, ChildMemory } from '../types';
import { calculateAgeInMonths } from '../utils/whoStandards';
import {
  Camera,
  Video,
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import {
  getAccessToken,
  googleSignIn,
  googleSignOut,
  uploadMediaToGoogleDrive,
  auth,
} from '../services/googleDriveService';
import { saveOnlineMemory } from '../services/apiService';
import { saveMemoryToFirestore } from '../services/firestoreService';
import { compressImageFile } from '../utils/imageCompressor';
import { ClothespinClip } from './ClothespinClip';

interface UploadMediaModalProps {
  child: ChildProfile;
  latestWeight?: number;
  latestHeight?: number;
  onClose: () => void;
  onSaveMemory: (memory: ChildMemory) => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  child,
  latestWeight = 10.4,
  latestHeight = 81.2,
  onClose,
  onSaveMemory,
}) => {
  const [sourceMode, setSourceMode] = useState<'gallery' | 'camera_live'>('gallery');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightAtMoment, setWeightAtMoment] = useState<string>(latestWeight.toString());
  const [category, setCategory] = useState<ChildMemory['category']>('milestone');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload Progress State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStageText, setUploadStageText] = useState('');

  // Google Drive state
  const [driveUser, setDriveUser] = useState(auth.currentUser);
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);

  // Live Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const ageAtDate = calculateAgeInMonths(child.birthDate, date);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setDriveUser(user);
    });
    return () => unsub();
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Connect Google Drive
  const handleConnectDrive = async () => {
    setIsDriveConnecting(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setDriveUser(res.user);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal menghubungkan Google Drive');
    } finally {
      setIsDriveConnecting(false);
    }
  };

  const handleDisconnectDrive = async () => {
    try {
      await googleSignOut();
      setDriveUser(null);
    } catch (err) {
      console.warn('Gagal menonaktifkan akun:', err);
    }
  };

  // Start live in-app camera
  const startLiveCamera = async (mode: 'user' | 'environment' = facingMode) => {
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setSourceMode('camera_live');
    } catch (err: any) {
      console.warn('Camera access denied or unavailable, falling back to system camera input', err);
      cameraInputRef.current?.click();
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      setCameraStream(null);
    }
  };

  const capturePhotoFromLiveCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      setMediaType('image');
      stopLiveCamera();
      setSourceMode('gallery');
    }, 'image/jpeg', 0.9);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');
    setPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) {
      setErrorMessage('Pilih atau ambil foto/video kenangan terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setUploadStageText('Menyiapkan media...');
    setErrorMessage(null);

    try {
      let finalMediaUrl = previewUrl || '';
      let driveFileId: string | undefined;
      let driveLink: string | undefined;

      // 1. Get or request Google Drive access token
      let token = await getAccessToken();
      if (!token) {
        setUploadStageText('Menghubungkan ke Google Drive...');
        try {
          const authRes = await googleSignIn();
          if (authRes) {
            token = authRes.accessToken;
            setDriveUser(authRes.user);
          }
        } catch (signInErr: any) {
          console.warn('Google sign in skipped or closed:', signInErr);
          // If user closed popup, we can still save locally if preview exists
          if (!previewUrl) {
            throw new Error('Diperlukan izin Google Drive untuk menyimpan media. Silakan hubungkan akun Google Anda.');
          }
        }
      }

      // 2. Upload directly to Google Drive as the primary storage
      if (token && (selectedFile || previewUrl)) {
        setUploadProgress(35);
        setUploadStageText(
          mediaType === 'video'
            ? 'Mengunggah video ke folder Google Drive Anda...'
            : 'Mengoptimalkan foto & mengunggah ke Google Drive...'
        );

        let fileToUpload: File | Blob | string = selectedFile || previewUrl!;
        let mime = mediaType === 'video' ? (selectedFile?.type || 'video/mp4') : 'image/jpeg';
        const fileExt = mediaType === 'video' ? 'mp4' : 'jpg';
        const safeTitle = (title || 'Momen').replace(/[^a-zA-Z0-9_\-]/g, '_');
        const fileName = `${safeTitle}_${date}.${fileExt}`;

        // If it's an image, apply gentle client-side compression to speed up upload
        if (selectedFile && mediaType === 'image') {
          try {
            const compressed = await compressImageFile(selectedFile, 1920, 1920, 0.85);
            fileToUpload = compressed.file;
          } catch (compErr) {
            console.warn('Kompresi gambar dilewati, mengunggah berkas asli:', compErr);
          }
        }

        setUploadProgress(50);
        const driveResult = await uploadMediaToGoogleDrive(
          token,
          fileName,
          mime,
          fileToUpload,
          child.name,
          (stage) => setUploadStageText(stage)
        );

        if (driveResult) {
          driveFileId = driveResult.fileId;
          driveLink = driveResult.webViewLink;
          finalMediaUrl = driveResult.directUrl;
        }
      }

      setUploadProgress(90);
      setUploadStageText('Menyimpan data catatan ke database...');

      const memory: ChildMemory = {
        id: `mem_${Date.now()}`,
        childId: child.id,
        title: title || (mediaType === 'video' ? 'Momen Video Berharga' : 'Momen Berharga'),
        date,
        ageDisplay: `Usia ${ageAtDate.display}`,
        weightAtMoment: weightAtMoment ? parseFloat(weightAtMoment) : undefined,
        heightAtMoment: latestHeight,
        mediaUrl: finalMediaUrl,
        mediaType,
        caption,
        category,
        tags: [category === 'milestone' ? 'Milestone' : 'Keseharian', child.name],
        isPolaroidFavorite: true,
        driveFileId,
        driveLink,
      };

      // Save to Firebase Firestore and local database
      try {
        await saveMemoryToFirestore(memory);
      } catch (fsErr) {
        console.warn('Simpan ke Firestore info:', fsErr);
      }
      await saveOnlineMemory(memory);

      setUploadProgress(100);
      setUploadStageText('Berhasil disimpan ke Google Drive!');
      onSaveMemory(memory);
      stopLiveCamera();
      onClose();
    } catch (err: any) {
      console.error('Error submitting memory:', err);
      setErrorMessage('Gagal mengunggah foto/video: ' + (err.message || 'Periksa jaringan Google Drive Anda'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-stone-200 my-6 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Aesthetic Clothespin Clip on top */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <ClothespinClip color="wood" rotation={-2} size="lg" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Simpan Momen & Kenangan</h3>
              <p className="text-xs text-slate-500">Jurnal Buah Hati: {child.name}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-slate-400 hover:text-slate-600 flex items-center justify-center text-sm font-semibold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Dedicated Google Drive Storage Destination Card */}
        <div className="mb-4 p-3.5 rounded-2xl border border-stone-200 bg-white shadow-xs">
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <Cloud className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-900 truncate">Penyimpanan: Google Drive</p>
                  {driveUser && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {driveUser
                    ? `${driveUser.email} (Folder: TumbuhKembang - Jurnal Buah Hati)`
                    : 'Foto & video akan disimpan langsung di Google Drive pribadi Anda'}
                </p>
              </div>
            </div>

            {driveUser ? (
              <button
                type="button"
                onClick={handleDisconnectDrive}
                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-stone-500 hover:text-rose-600 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                title="Ganti akun Google"
              >
                Ganti Akun
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConnectDrive}
                disabled={isDriveConnecting}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
              >
                {isDriveConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghubungkan...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5 text-teal-300" />
                    <span>Sambungkan Drive</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Upload Progress Bar if uploading */}
        {isUploading && (
          <div className="mb-4 p-3.5 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>{uploadStageText}</span>
              </span>
              <span className="font-mono text-teal-400">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-teal-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Hidden system input triggers for Camera & Video on Mobile */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Media Capture / Select Mode */}
        {sourceMode === 'camera_live' ? (
          <div className="mb-4 bg-black rounded-2xl overflow-hidden relative aspect-4/3 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-4 z-10">
              <button
                type="button"
                onClick={() => {
                  const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                  setFacingMode(nextMode);
                  startLiveCamera(nextMode);
                }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30"
                title="Putar Kamera"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={capturePhotoFromLiveCamera}
                className="w-14 h-14 rounded-full bg-white border-4 border-teal-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                title="Ambil Foto"
              >
                <div className="w-10 h-10 rounded-full bg-teal-600" />
              </button>
              <button
                type="button"
                onClick={() => {
                  stopLiveCamera();
                  setSourceMode('gallery');
                }}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden bg-white border border-stone-200 aspect-4/3 flex items-center justify-center shadow-xs">
                {mediaType === 'video' ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
                {weightAtMoment && (
                  <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {weightAtMoment} kg
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="absolute bottom-3 right-3 bg-white/90 text-slate-700 hover:text-rose-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-stone-200 shadow-xs cursor-pointer"
                >
                  Ganti Media
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-5 bg-white text-center">
                <div className="flex justify-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="w-11 h-11 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Video className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Ambil Foto/Video atau Pilih dari Galeri
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Dukung format foto & rekaman video langsung untuk disimpan ke Google Drive
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => startLiveCamera('environment')}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Buka Kamera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl bg-white hover:bg-stone-50 text-slate-800 border border-stone-300 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>Pilih Galeri</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold rounded-xl bg-white hover:bg-stone-50 text-slate-800 border border-stone-300 transition-colors cursor-pointer"
                  >
                    <Video className="w-4 h-4 text-rose-500" />
                    <span>Rekam Video</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Metadata Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Momen Kenangan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Langkah Pertama Menuju Ayah"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Kejadian
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Otomatis: {ageAtDate.display}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Berat Badan Saat Itu (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="Misal: 10.4"
                value={weightAtMoment}
                onChange={(e) => setWeightAtMoment(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">
                Muncul di badge sudut polaroid
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Momen
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'milestone', label: 'Milestone Tumbuh' },
                { key: 'daily', label: 'Aktivitas Keseharian' },
                { key: 'family', label: 'Momen Bersama Ayah/Ibu' },
                { key: 'mpasi', label: 'Makan & MPASI' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setCategory(cat.key as any)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                    category === cat.key
                      ? 'bg-teal-700 text-white border-teal-700 font-semibold'
                      : 'bg-white text-slate-600 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cerita / Catatan Manis
            </label>
            <textarea
              rows={2}
              placeholder="Ceritakan momen seru saat foto/video ini diambil..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 rounded-xl transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{`Mengunggah (${uploadProgress}%)...`}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-teal-300" />
                  <span>Simpan ke Google Drive</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
