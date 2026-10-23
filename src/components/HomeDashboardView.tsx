import React, { useState } from 'react';
import { ChildProfile, GrowthRecord, ChildMemory } from '../types';
import { calculateAgeInMonths } from '../utils/whoStandards';
import { Camera, Sparkles, Scale, Ruler, Clock, MoreVertical, Video, Plus, Edit3, Trash2, Heart, ExternalLink, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { ClothespinClip } from './ClothespinClip';
import { downloadMediaFile } from '../utils/imageCompressor';

interface HomeDashboardViewProps {
  child: ChildProfile;
  latestRecord?: GrowthRecord;
  memories: ChildMemory[];
  onOpenUploadModal: () => void;
  onOpenRecordModal: () => void;
  onOpenEditProfileModal: () => void;
  onNavigateTab: (tab: 'growth' | 'milestones' | 'kolase' | 'consult') => void;
  onDeleteMemory?: (id: string) => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  child,
  latestRecord,
  memories,
  onOpenUploadModal,
  onOpenRecordModal,
  onOpenEditProfileModal,
  onNavigateTab,
  onDeleteMemory,
}) => {
  const [selectedMemory, setSelectedMemory] = useState<ChildMemory | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const handleDownloadMedia = async (mem: ChildMemory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setDownloadingId(mem.id);
      const ext = mem.mediaType === 'video' ? 'mp4' : 'jpg';
      const cleanTitle = (mem.title || 'Momen').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${child.name}_${cleanTitle}_${mem.date}.${ext}`;
      await downloadMediaFile(mem.mediaUrl, filename);
      setDownloadSuccessId(mem.id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    } catch (err) {
      console.warn('Gagal mengunduh media:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const age = calculateAgeInMonths(child.birthDate);

  // Fallback values from screenshot if no records yet
  const weightVal = latestRecord ? latestRecord.weight : 10.4;
  const heightVal = latestRecord ? latestRecord.height : 81.2;
  const headVal = latestRecord?.headCircumference || 46.5;
  const checkupDate = latestRecord ? latestRecord.date : '12 Oktober 2026';
  const checkupAge = latestRecord ? `Usia ${latestRecord.ageMonths} Bulan` : 'Usia 6 Bulan';

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      {/* 1. Main Child Profile Card with Clothespin clip on top (Matching user screenshot 7356d508) */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-sm relative mt-4">
        {/* Aesthetic Clothespin Clip on top of the Profile Bar */}
        <div className="absolute -top-4 right-14 z-10">
          <ClothespinClip color="wood" rotation={3} size="md" />
        </div>
        <div className="absolute -top-4 left-14 z-10">
          <ClothespinClip color="teal" rotation={-2} size="sm" />
        </div>

        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-4">
            {/* Child Avatar with Green Camera overlay button */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs">
                <img
                  src={child.photoUrl || '/src/assets/images/salma_langkah_pertama_1792645493899.jpg'}
                  alt={child.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={onOpenEditProfileModal}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
                title="Ganti Foto Buah Hati"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Child Info */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {child.name}
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {child.gender === 'female' ? 'Perempuan' : 'Laki-laki'}
                </span>
              </div>

              {/* Age and Birthdate */}
              <p className="text-xs text-slate-500 font-medium mt-1">
                <span className="font-bold text-slate-800">{age.display}</span>
                <span className="mx-1.5 text-stone-300">·</span>
                <span>Lahir {child.birthDate}</span>
              </p>

              {/* Parent */}
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {child.parentName || 'Ayah Rahman'}
              </p>

              {/* Status & Ganti Foto Link */}
              <div className="mt-2.5 flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => onNavigateTab('growth')}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                  title="Lihat Kurva KMS WHO & Evaluasi Antropometri"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Tumbuh Sehat & Terpantau</span>
                </button>

                <button
                  onClick={onOpenEditProfileModal}
                  className="text-[11px] font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  Ganti Foto & Profil
                </button>
              </div>
            </div>
          </div>

          {/* 3-dots Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-8 h-8 rounded-full hover:bg-stone-100 text-stone-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-9 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-20 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    onOpenEditProfileModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-800 font-semibold"
                >
                  Ubah Biodata & Nama
                </button>
                <button
                  onClick={() => {
                    onOpenUploadModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700"
                >
                  Unggah Foto / Video
                </button>
                <button
                  onClick={() => {
                    onOpenRecordModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700"
                >
                  Catat Pengukuran Baru
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('growth');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-stone-50 text-teal-800 font-semibold"
                >
                  Lihat Kurva KMS WHO
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 2. 4-Grid Anthropometry Cards with aesthetic mini clips */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {/* Berat Badan (BB) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-2xs flex flex-col justify-between relative group">
          <div className="absolute -top-3 right-3 sm:right-4 z-10">
            <ClothespinClip color="wood" rotation={-4} size="sm" />
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">Berat Badan (BB)</span>
            <button
              onClick={onOpenRecordModal}
              className="text-[10px] sm:text-[11px] font-semibold text-teal-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Input</span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                {weightVal} kg
              </div>
            </div>
          </div>
        </div>

        {/* Tinggi Badan (TB) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-2xs flex flex-col justify-between relative group">
          <div className="absolute -top-3 right-3 sm:right-4 z-10">
            <ClothespinClip color="teal" rotation={3} size="sm" />
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">Tinggi Badan (TB)</span>
            <button
              onClick={onOpenRecordModal}
              className="text-[10px] sm:text-[11px] font-semibold text-teal-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Input</span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                {heightVal} cm
              </div>
            </div>
          </div>
        </div>

        {/* Lingkar Kepala (LK) */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-2xs flex flex-col justify-between relative group">
          <div className="absolute -top-3 right-3 sm:right-4 z-10">
            <ClothespinClip color="yellow" rotation={-2} size="sm" />
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">Lingkar Kepala</span>
            <button
              onClick={onOpenRecordModal}
              className="text-[10px] sm:text-[11px] font-semibold text-teal-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Input</span>
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-base sm:text-xl font-black text-slate-900 font-mono tracking-tight">
                {headVal} cm
              </div>
            </div>
          </div>
        </div>

        {/* Pemeriksaan Terakhir */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-2xs flex flex-col justify-between relative group">
          <div className="absolute -top-3 right-3 sm:right-4 z-10">
            <ClothespinClip color="pink" rotation={2} size="sm" />
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">Pemeriksaan</span>
            <button
              onClick={onOpenRecordModal}
              className="text-[10px] sm:text-[11px] font-semibold text-teal-700 hover:underline cursor-pointer whitespace-nowrap"
            >
              Catat Baru
            </button>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="truncate">
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {checkupDate}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                {checkupAge}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Momen & Kenangan Terkini Section (Matching screenshot 2) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Momen & Kenangan Terkini
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Polaroid Terbaru
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kilas potret tumbuh kembang {child.name}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('kolase')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <span>Buka Galeri Kolase →</span>
          </button>
        </div>

        {/* Polaroid Memory Cards Grid with clothespin clips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-3">
          {memories.map((mem, index) => {
            const rotations = [-2, 3, -1, 2, -3];
            const rot = rotations[index % rotations.length];

            return (
              <div
                key={mem.id}
                onClick={() => setSelectedMemory(mem)}
                className="bg-white rounded-2xl border border-stone-200/90 p-2.5 shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between relative mt-2"
              >
                {/* Clothespin Clip pinned at the top center of each polaroid */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <ClothespinClip color={index % 2 === 0 ? 'wood' : 'teal'} rotation={rot} size="sm" />
                </div>

                {/* Media Container with Weight badge overlay */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 mt-1">
                  {mem.mediaType === 'video' ? (
                    <video
                      src={mem.mediaUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <img
                      src={mem.mediaUrl}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}

                  {/* Weight badge overlay on top right */}
                  {mem.weightAtMoment && (
                    <div className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {mem.weightAtMoment} kg
                    </div>
                  )}

                  {/* Video indicator icon */}
                  {mem.mediaType === 'video' && (
                    <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <Video className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* Title, Age and Download Action */}
                <div className="pt-2 px-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                      {mem.title}
                    </h4>
                    <button
                      onClick={(e) => handleDownloadMedia(mem, e)}
                      title="Unduh foto/video ke HP"
                      className="p-1 rounded-md text-stone-400 hover:text-teal-700 hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                    >
                      {downloadingId === mem.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                      ) : downloadSuccessId === mem.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {mem.ageDisplay}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Quick Add Memory Box */}
          <button
            onClick={onOpenUploadModal}
            className="border-2 border-dashed border-stone-300 hover:border-teal-500 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-white/60 hover:bg-teal-50/40 transition-colors cursor-pointer aspect-square min-h-[140px] mt-2 relative"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">+ Tambah Momen</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Kamera / Galeri</span>
          </button>
        </div>
      </div>

      {/* Memory Fullscreen Preview Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200">
            <div className="relative aspect-4/3 bg-black flex items-center justify-center">
              {selectedMemory.mediaType === 'video' ? (
                <video
                  src={selectedMemory.mediaUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={selectedMemory.mediaUrl}
                  alt={selectedMemory.title}
                  className="w-full h-full object-contain"
                />
              )}
              {selectedMemory.weightAtMoment && (
                <div className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs font-mono font-bold px-3 py-1 rounded-full shadow-md">
                  {selectedMemory.weightAtMoment} kg
                </div>
              )}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 bg-white space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedMemory.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedMemory.ageDisplay} · Tanggal {selectedMemory.date}
                  </p>
                </div>
                {onDeleteMemory && (
                  <button
                    onClick={() => {
                      onDeleteMemory(selectedMemory.id);
                      setSelectedMemory(null);
                    }}
                    className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                    title="Hapus memori ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {selectedMemory.caption && (
                <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  {selectedMemory.caption}
                </p>
              )}

              {selectedMemory.driveLink && (
                <div className="pt-2">
                  <a
                    href={selectedMemory.driveLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:underline font-semibold"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka Berkas di Google Drive</span>
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  onClick={() => handleDownloadMedia(selectedMemory)}
                  disabled={downloadingId === selectedMemory.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  {downloadingId === selectedMemory.id ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengunduh...</span>
                    </>
                  ) : downloadSuccessId === selectedMemory.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Tersimpan di HP!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh {selectedMemory.mediaType === 'video' ? 'Video' : 'Foto'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedMemory(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
