import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, Share, PlusSquare, X, CheckCircle2, ArrowRight } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'menu-item';
  onInstalled?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  onInstalled,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as an installed PWA or marked installed, hide completely!
  if (isInstalled) {
    return null;
  }

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onInstalled?.();
        return;
      }
    }
    // Show guide modal if native prompt not available or on iOS
    setShowGuideModal(true);
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleTriggerInstall}
          className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 animate-pulse hover:animate-none"
          title="Instal Aplikasi TumbuhKembang ke HP Anda"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-100" />
          <span className="text-[11px] sm:text-xs whitespace-nowrap">Instal App</span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white rounded-2xl p-3.5 sm:p-4 shadow-md flex items-center justify-between gap-3 border border-teal-600">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-teal-200" />
            </div>
            <div className="truncate">
              <p className="text-xs sm:text-sm font-extrabold truncate">
                Pasang di Layar Utama HP
              </p>
              <p className="text-[10px] sm:text-[11px] text-teal-100 mt-0.5 truncate">
                Akses cepat, offline & tampilan layar penuh seperti aplikasi asli
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerInstall}
            className="px-3.5 py-1.5 rounded-xl bg-white text-teal-900 text-xs font-black shadow-xs hover:bg-teal-50 transition-all shrink-0 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Instal Sekarang
          </button>
        </div>
      )}

      {variant === 'menu-item' && (
        <button
          onClick={handleTriggerInstall}
          className="w-full text-left px-4 py-2 hover:bg-stone-50 text-teal-800 font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5 text-teal-600" />
          <span>Instal Aplikasi di HP</span>
        </button>
      )}

      {/* Manual Installation Guide Modal (for iOS or fallback) */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Cara Pasang di HP
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {isIOS ? (
              // iOS Safari Guide
              <div className="space-y-3.5 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">
                  Untuk pengguna iPhone / iPad di peramban Safari:
                </p>
                <div className="space-y-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="inline w-3.5 h-3.5 text-teal-700 mx-0.5" /> di bilah navigasi bawah Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Gulir ke bawah dan pilih opsi <strong>"Tambah ke Layar Utama" (Add to Home Screen)</strong> <PlusSquare className="inline w-3.5 h-3.5 text-teal-700 mx-0.5" />.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Ikon TumbuhKembang akan otomatis muncul di menu HP Anda!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Android / Chrome Guide
              <div className="space-y-3.5 text-xs text-slate-700">
                <p className="font-semibold text-slate-800">
                  Untuk pengguna Android / Chrome:
                </p>
                <div className="space-y-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      1
                    </span>
                    <p>
                      Ketuk ikon <strong>Titik Tiga (⋮)</strong> di pojok kanan atas peramban Chrome.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Pilih menu <strong>"Instal Aplikasi"</strong> atau <strong>"Tambahkan ke Layar Utama"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Konfirmasi instalasi. Aplikasi akan terinstal langsung seperti aplikasi resmi dari Play Store!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  localStorage.setItem('tk_app_installed', 'true');
                  setShowGuideModal(false);
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Sudah Terinstal
              </button>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
