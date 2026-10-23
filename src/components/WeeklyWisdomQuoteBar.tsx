import React, { useState } from 'react';
import { Sparkles, BookOpen, Volume2, Quote } from 'lucide-react';

export const WEEKLY_QUOTES: string[] = [
  'Kehadiran seorang anak adalah anugerah terindah dari Tuhan yang membawa rezeki serta kebahagiaan yang tidak ternilai harganya ke dalam rumah tangga.',
  'Setiap lelah dalam mengurus dan mendidik anak bernilai ibadah di sisi-Nya, karena kesabaran orang tua adalah ladang pahala yang luar biasa.',
  'Tetaplah semangat dan ikhlas dalam merawat buah hati, sebab setiap keringat dan pengorbanan hari ini akan menjadi investasi kebaikan di masa depan.',
  'Menemani tumbuh kembang anak dengan penuh cinta kasih bukan sekadar tugas, melainkan bentuk syukur atas amanah mulia yang dipercayakan kepada kita.',
  'Pelukan hangat dan senyuman anak di tengah penatnya hari adalah pengingat bahwa Allah telah menitipkan surga kecil di dalam keluarga kita.',
  'Jadikan setiap detik membersamai anak sebagai momen berharga untuk menanamkan kebaikan sekaligus mendekatkan diri kepada Sang Pencipta.',
  'Tidak ada usaha mendidik anak yang sia-sia; setiap doa dan didikan tulus adalah bentuk ketaatan serta ibadah terbaik seorang orang tua.',
];

// Helper to get today's quote automatically based on current day of the week
function getTodayQuote(): string {
  const day = new Date().getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const idx = day === 0 ? 6 : day - 1; // 0..6
  return WEEKLY_QUOTES[idx];
}

export const WeeklyWisdomQuoteBar: React.FC = () => {
  const [viewMode, setViewMode] = useState<'ticker' | 'reader'>('ticker');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const todayQuote = getTodayQuote();

  return (
    <div className="w-full relative overflow-hidden rounded-2xl border border-teal-700/30 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white shadow-xs transition-all">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none blur-xl" />
      <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-teal-400/10 pointer-events-none blur-lg" />

      {/* Top Header Row: Clean, uncrowded so 'Mutiara Parenting' is fully visible on mobile */}
      <div className="px-3 py-1.5 border-b border-teal-600/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded-md bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          </div>
          <span className="font-extrabold text-[11px] sm:text-xs text-white tracking-wide whitespace-nowrap">
            Mutiara Parenting
          </span>
        </div>

        {/* View Mode Toggle Button */}
        <button
          onClick={() => setViewMode(viewMode === 'ticker' ? 'reader' : 'ticker')}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/15 hover:bg-white/25 text-teal-100 hover:text-white text-[10px] font-bold cursor-pointer transition-colors shrink-0"
          title={viewMode === 'ticker' ? 'Buka Mode Baca Penuh' : 'Beralih ke Pesan Berjalan'}
        >
          {viewMode === 'ticker' ? (
            <>
              <BookOpen className="w-3 h-3 text-teal-200" />
              <span>Mode Baca</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3 h-3 text-teal-200" />
              <span>Berjalan</span>
            </>
          )}
        </button>
      </div>

      {/* Content Area - Compact & Automatic */}
      {viewMode === 'ticker' ? (
        /* MODE PESAN BERJALAN (SLIM TICKER) */
        <div
          className="px-3 py-2 flex items-center gap-2 group cursor-pointer"
          onClick={() => setViewMode('reader')}
          title="Ketuk untuk membaca pesan lengkap"
        >
          <div className="w-5 h-5 rounded-md bg-teal-900/60 flex items-center justify-center shrink-0 border border-teal-500/30 text-teal-200">
            <Quote className="w-3 h-3" />
          </div>

          {/* Marquee Text Container */}
          <div
            className="overflow-hidden relative flex-1 whitespace-nowrap"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className={`inline-block text-[11px] font-medium text-teal-50 tracking-wide transition-transform ${
                isPaused ? '' : 'animate-marquee'
              }`}
            >
              <span>"{todayQuote}"</span>
              <span className="mx-6 text-teal-400/60 font-bold">✦</span>
              <span className="text-teal-200 text-[10px] italic">
                (Ketuk untuk mode baca tenang)
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* MODE BACA RINGKAS & TENANG (COMPACT READING CARD) */
        <div className="px-3.5 py-3 space-y-2">
          <div className="bg-teal-900/40 rounded-xl p-3 border border-teal-500/20 relative backdrop-blur-xs">
            <Quote className="w-4 h-4 text-teal-300/30 absolute top-2 right-2" />
            <p className="text-xs sm:text-[13px] font-medium text-white leading-relaxed italic pr-4">
              "{todayQuote}"
            </p>
            <p className="text-[10px] text-teal-200/80 mt-2 pt-1.5 border-t border-teal-700/30">
              Pesan penyejuk hati orang tua hari ini
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
