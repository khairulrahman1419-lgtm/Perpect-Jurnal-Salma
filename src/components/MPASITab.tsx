import React, { useState } from 'react';
import { ChildProfile } from '../types';
import { MPASI_STAGES, STUNTING_PREVENTION_TIPS } from '../data/mpasiData';
import { calculateAgeInMonths } from '../utils/whoStandards';
import { Utensils, Sparkles, AlertTriangle, ShieldCheck, Clock, Check, Loader2, BookOpen } from 'lucide-react';

interface MPASITabProps {
  child: ChildProfile;
}

export const MPASITab: React.FC<MPASITabProps> = ({ child }) => {
  const age = calculateAgeInMonths(child.birthDate);

  // Default active stage based on child's age
  const initialStageIdx = age.months < 9 ? 0 : age.months < 12 ? 1 : 2;
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(initialStageIdx);

  // AI Planner state
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiMenuPlan, setAiMenuPlan] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [allergies, setAllergies] = useState('Tidak ada alergi');
  const [preferences, setPreferences] = useState('Bahan lokal: Hati ayam, telur, ikan kembung, santan, bayam');

  const activeStage = MPASI_STAGES[selectedStageIdx];

  const handleGenerateAiMenu = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    setAiMenuPlan(null);

    try {
      const res = await fetch('/api/ai/mpasi-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageMonths: age.months,
          allergies,
          preferences,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat menu MPASI');
      setAiMenuPlan(data.plan);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Terjadi kesalahan saat membuat resep AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with image split */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          <div className="md:col-span-7 p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Pedoman Nutrisi IDAI
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500">Pencegahan Stunting</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Panduan MPASI & Gizi Seimbang
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              MPASI berkualitas wajib memenuhi kebutuhan makronutrien dan mikronutrien anak. Kunci utama pencegahan stunting pada periode 1000 Hari Pertama Kehidupan (HPK) adalah asupan <strong>Protein Hewani</strong> yang konsisten di setiap jam makan.
            </p>

            {/* Stage Selector Pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {MPASI_STAGES.map((stg, i) => (
                <button
                  key={stg.ageRange}
                  onClick={() => setSelectedStageIdx(i)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    selectedStageIdx === i
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {stg.ageRange}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-5 h-64 md:h-full relative overflow-hidden bg-slate-100">
            <img
              src="/src/assets/images/mpasi_gizi_seimbang_1792637535064.jpg"
              alt="Piring MPASI gizi seimbang dengan salmon, nasi tim, telur, dan brokoli"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Selected Stage Detail Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
              {activeStage.ageRange}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {activeStage.stage}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Usia {child.name}: {age.display}
          </span>
        </div>

        {/* 3 Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Tekstur Makanan</span>
            <p className="text-xs font-semibold text-slate-900 mt-1 leading-snug">
              {activeStage.texture}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Frekuensi Makan</span>
            <p className="text-xs font-semibold text-slate-900 mt-1 leading-snug">
              {activeStage.frequency}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Porsi Sekali Makan</span>
            <p className="text-xs font-semibold text-slate-900 mt-1 leading-snug">
              {activeStage.portion}
            </p>
          </div>
        </div>

        {/* Golden Rule Callout */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-950">Aturan Emas Nutrisi (IDAI):</p>
              <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                {activeStage.keyRule}
              </p>
            </div>
          </div>
        </div>

        {/* Sample Daily Menu */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-slate-600" />
            <span>Contoh Jadwal & Menu Harian Usia {activeStage.ageRange}</span>
          </h4>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {activeStage.sampleMenu.map((m, idx) => (
              <div key={idx} className="p-3.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 font-mono w-28 shrink-0">
                    {m.mealTime}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{m.dish}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{m.composition}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start sm:self-auto">
                  Padat Gizi
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Custom MPASI Planner Tool */}
      <div className="bg-gradient-to-r from-sky-50/70 via-white to-indigo-50/70 rounded-xl border border-sky-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Generator Jadwal & Resep MPASI AI
            </h3>
            <p className="text-xs text-slate-500">
              Personalisasi menu harian kaya protein hewani sesuai bahan yang tersedia di kulkas Anda
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bahan yang Tersedia di Rumah
            </label>
            <input
              type="text"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Contoh: Hati ayam, ikan kembung, telur puyuh, santan, bayam"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Riwayat Alergi / Pantangan Anak
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Contoh: Tidak ada alergi / Alergi udang / Hindari susu sapi"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateAiMenu}
          disabled={isGeneratingAi}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isGeneratingAi ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Menyusun Menu Padat Gizi...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Susun Menu MPASI Khusus {child.name}</span>
            </>
          )}
        </button>

        {aiError && (
          <p className="text-xs text-rose-600 mt-2 font-medium">
            {aiError}
          </p>
        )}

        {/* AI Result Card */}
        {aiMenuPlan && (
          <div className="mt-5 p-5 bg-white rounded-xl border border-sky-200 shadow-xs animate-in fade-in duration-200">
            <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 font-mono">
              Rekomendasi Menu AI untuk {child.name} ({age.display}):
            </h4>
            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
              {aiMenuPlan}
            </div>
          </div>
        )}
      </div>

      {/* Stunting Prevention Scientific Tips Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Fakta Klinis Pencegahan Stunting (Kemenkes & IDAI)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STUNTING_PREVENTION_TIPS.map((tip, idx) => (
            <div key={idx} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60">
              <p className="text-xs font-bold text-slate-900">{tip.title}</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
