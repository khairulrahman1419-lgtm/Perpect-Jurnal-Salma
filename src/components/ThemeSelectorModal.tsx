import React from 'react';
import { Palette, X, Check, Eye, Sliders, Sparkles } from 'lucide-react';
import { ClothespinClip } from './ClothespinClip';

export interface WallpaperTheme {
  id: string;
  name: string;
  subtitle: string;
  type: 'pattern' | 'cover' | 'none';
  url?: string;
  bgColor: string;
  patternSize: string;
}

export const WALLPAPER_THEMES: WallpaperTheme[] = [
  {
    id: 'classic_cream',
    name: 'Krem Mainan & Botol',
    subtitle: 'Warna hangat pastel susu dengan bintang & kerincingan',
    type: 'pattern',
    url: '/public/assets/aistudio/image_307566b4.png',
    bgColor: '#FAF7F2',
    patternSize: '240px 240px',
  },
  {
    id: 'sky_doodle',
    name: 'Doodle Biru Langit',
    subtitle: 'Kereta dorong bayi, bebek karet & balok alfabet ceria',
    type: 'pattern',
    url: '/src/assets/images/wallpaper_sky_blue_doodle_1792651370748.jpg',
    bgColor: '#F2F8FA',
    patternSize: '260px 260px',
  },
  {
    id: 'colorful_rainbow',
    name: 'Pelangi & Bangau Bayi',
    subtitle: 'Ilustrasi bangau pembawa bayi, pelangi & kuda goyang',
    type: 'pattern',
    url: '/src/assets/images/wallpaper_colorful_nursery_1792651371158.jpg',
    bgColor: '#FAF8F5',
    patternSize: '280px 280px',
  },
  {
    id: 'hanging_clouds',
    name: 'Gantungan Boneka & Awan',
    subtitle: 'Nursery mobile gantung awan lembut & beruang teddy',
    type: 'cover',
    url: '/src/assets/images/wallpaper_hanging_clouds_1792651371184.jpg',
    bgColor: '#EDF5FA',
    patternSize: 'cover',
  },
  {
    id: 'minimal_clean',
    name: 'Minimalis Lembut',
    subtitle: 'Latar polos bersih tanpa gambar agar fokus membaca data',
    type: 'none',
    bgColor: '#FAF8F5',
    patternSize: 'auto',
  },
];

interface ThemeSelectorModalProps {
  currentThemeId: string;
  bgOpacity: number;
  onSelectTheme: (themeId: string) => void;
  onChangeOpacity: (opacity: number) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  currentThemeId,
  bgOpacity,
  onSelectTheme,
  onChangeOpacity,
  onClose,
}) => {
  const activeTheme = WALLPAPER_THEMES.find((t) => t.id === currentThemeId) || WALLPAPER_THEMES[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4 z-50 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Pilih Tema Wallpaper Bayi
              </h2>
              <p className="text-[11px] font-medium text-slate-500">
                Ubah suasana visual & atur tingkat kejelasan latar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-500 flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Live Preview Card with Clothespin Clip */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-teal-600" />
                <span>Pratinjau Tampilan ({activeTheme.name})</span>
              </span>
              <span className="text-[11px] font-mono text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                Transparansi: {bgOpacity}%
              </span>
            </div>

            <div 
              className="relative rounded-2xl border border-stone-200/90 p-4 shadow-sm overflow-hidden min-h-[110px] flex items-center justify-between transition-all"
              style={{ backgroundColor: activeTheme.bgColor }}
            >
              {/* Wallpaper Layer Preview */}
              {activeTheme.url && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                  style={{
                    backgroundImage: `url('${activeTheme.url}')`,
                    backgroundRepeat: activeTheme.type === 'cover' ? 'no-repeat' : 'repeat',
                    backgroundSize: activeTheme.type === 'cover' ? 'cover' : '140px 140px',
                    backgroundPosition: 'center',
                    opacity: bgOpacity / 100,
                  }}
                />
              )}

              {/* Sample Floating Clothespin Clip */}
              <div className="absolute -top-3 left-8 z-10">
                <ClothespinClip color="wood" rotation={-3} size="sm" />
              </div>
              <div className="absolute -top-3 right-8 z-10">
                <ClothespinClip color="teal" rotation={2} size="sm" />
              </div>

              {/* Card Sample Content */}
              <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-xl p-3 border border-stone-200/80 shadow-xs max-w-full w-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-2xs shrink-0">
                    👶
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-slate-900 truncate">Ning Salma</p>
                    <p className="text-[10px] text-slate-500 font-medium">Tumbuh Sehat & Ceria</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                  Aktif
                </span>
              </div>
            </div>
          </div>

          {/* 2. Opacity Slider & Quick Presets */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-600" />
                <span>Atur Kejelasan Gambar Latar</span>
              </span>
              <span className="font-mono text-xs font-extrabold text-teal-700">{bgOpacity}%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={bgOpacity}
              onChange={(e) => onChangeOpacity(parseInt(e.target.value, 10))}
              className="w-full accent-teal-600 cursor-pointer h-2 bg-stone-200 rounded-lg appearance-none"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-0.5">
              <span>0% (Polos)</span>
              <span>25% (Halus)</span>
              <span>50% (Sedang)</span>
              <span>100% (Maksimal)</span>
            </div>

            {/* Quick Presets Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-stone-200">
              {[
                { label: 'Halus (15%)', val: 15 },
                { label: 'Nyaman (30%)', val: 30 },
                { label: 'Jelas (55%)', val: 55 },
                { label: 'Penuh (85%)', val: 85 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => onChangeOpacity(preset.val)}
                  className={`py-1.5 px-1 text-center text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    bgOpacity === preset.val
                      ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                      : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Theme List Selector (Touch-friendly & Visual Cards) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-800">
              Koleksi Desain Latar Bayi:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WALLPAPER_THEMES.map((theme) => {
                const isSelected = theme.id === currentThemeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onSelectTheme(theme.id)}
                    className={`text-left p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 relative overflow-hidden group ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/60'
                    }`}
                  >
                    {/* Thumbnail Preview Circle/Square */}
                    <div 
                      className="w-14 h-14 rounded-xl shrink-0 border border-stone-200 overflow-hidden relative shadow-2xs"
                      style={{ backgroundColor: theme.bgColor }}
                    >
                      {theme.url ? (
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `url('${theme.url}')`,
                            backgroundSize: theme.type === 'cover' ? 'cover' : '65px 65px',
                            backgroundRepeat: theme.type === 'cover' ? 'no-repeat' : 'repeat',
                            backgroundPosition: 'center',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100 text-xs font-bold">
                          Polos
                        </div>
                      )}
                    </div>

                    {/* Theme Details */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {theme.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {theme.subtitle}
                      </p>
                    </div>

                    {/* Checkmark Badge */}
                    <div className="absolute right-3 top-3">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-stone-300 group-hover:border-stone-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-500 font-medium">
            Pengaturan tema tersimpan otomatis di perangkat Anda
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
