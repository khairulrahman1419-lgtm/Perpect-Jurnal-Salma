import React, { useState, useEffect } from 'react';
import { ChildProfile, MilestoneTestRecord } from '../types';
import { KPSP_AGE_GROUPS, getRecommendedKPSPAge } from '../data/kpspData';
import { calculateAgeInMonths } from '../utils/whoStandards';
import { CheckCircle, AlertTriangle, XCircle, Award, Lightbulb, RotateCcw, Save } from 'lucide-react';

interface MilestoneKPSPTabProps {
  child: ChildProfile;
  milestoneHistory: MilestoneTestRecord[];
  onSaveAssessment: (record: MilestoneTestRecord) => void;
}

export const MilestoneKPSPTab: React.FC<MilestoneKPSPTabProps> = ({
  child,
  milestoneHistory,
  onSaveAssessment,
}) => {
  const age = calculateAgeInMonths(child.birthDate);
  const recommendedGroup = getRecommendedKPSPAge(age.months);

  const [selectedAgeMonths, setSelectedAgeMonths] = useState<number>(recommendedGroup.ageMonths);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [evaluatorNotes, setEvaluatorNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentGroup = KPSP_AGE_GROUPS.find(g => g.ageMonths === selectedAgeMonths) || KPSP_AGE_GROUPS[0];

  // Set default answers to true (Sesuai) when changing age group
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    currentGroup.questions.forEach(q => {
      initial[q.id] = true;
    });
    setAnswers(initial);
    setSavedSuccess(false);
  }, [selectedAgeMonths]);

  const toggleAnswer = (questionId: string, val: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    setSavedSuccess(false);
  };

  const totalQuestions = currentGroup.questions.length;
  const totalYes = Object.values(answers).filter(v => v === true).length;
  const totalNo = totalQuestions - totalYes;

  // Evaluation outcome based on Kemenkes SDIDTK:
  // If 6 questions: 5-6 = Sesuai, 4 = Meragukan, <= 3 = Penyimpangan
  let result: 'sesuai' | 'meragukan' | 'penyimpangan' = 'sesuai';
  if (totalYes >= totalQuestions - 1) {
    result = 'sesuai';
  } else if (totalYes >= totalQuestions - 2) {
    result = 'meragukan';
  } else {
    result = 'penyimpangan';
  }

  const handleSave = () => {
    const record: MilestoneTestRecord = {
      id: `kpsp_${Date.now()}`,
      childId: child.id,
      date: new Date().toISOString().split('T')[0],
      ageMonthsTested: selectedAgeMonths,
      answers,
      totalYes,
      totalNo,
      result,
      evaluatorNotes,
    };
    onSaveAssessment(record);
    setSavedSuccess(true);
  };

  // Helper for aspect badges
  const getAspectBadge = (aspect: string) => {
    switch (aspect) {
      case 'motorik_kasar': return { label: 'Motorik Kasar', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'motorik_halus': return { label: 'Motorik Halus', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'bicara_bahasa': return { label: 'Bicara & Bahasa', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'sosialisasi_kemandirian': return { label: 'Sosialisasi & Mandiri', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      default: return { label: aspect, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro & Screening Age Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Skrining KPSP (Kuesioner Pra-Skrining Perkembangan)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Standar Kemenkes RI SDIDTK untuk memantau 4 aspek tumbuh kembang anak secara berkala
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Usia {child.name}:</span>
            <span className="font-bold text-slate-900 font-mono">{age.display}</span>
          </div>
        </div>

        {/* Age Selector Chips */}
        <div className="pt-4">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Pilih Kelompok Usia Skrining:
          </label>
          <div className="flex flex-wrap gap-2">
            {KPSP_AGE_GROUPS.map((group) => {
              const isRecommended = group.ageMonths === recommendedGroup.ageMonths;
              const isSelected = group.ageMonths === selectedAgeMonths;

              return (
                <button
                  key={group.ageMonths}
                  onClick={() => setSelectedAgeMonths(group.ageMonths)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : isRecommended
                      ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {group.ageMonths} Bulan {isRecommended && '(Sesuai Usia)'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result Indicator Banner */}
      <div className={`p-5 rounded-xl border ${
        result === 'sesuai'
          ? 'bg-emerald-50/70 border-emerald-200'
          : result === 'meragukan'
          ? 'bg-amber-50/70 border-amber-200'
          : 'bg-rose-50/70 border-rose-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              result === 'sesuai'
                ? 'bg-emerald-600 text-white'
                : result === 'meragukan'
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white'
            }`}>
              {result === 'sesuai' && <CheckCircle className="w-5 h-5" />}
              {result === 'meragukan' && <AlertTriangle className="w-5 h-5" />}
              {result === 'penyimpangan' && <XCircle className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Hasil: {result === 'sesuai' ? 'Perkembangan Sesuai Usia' : result === 'meragukan' ? 'Perkembangan Meragukan' : 'Kemungkinan Penyimpangan'}
                </h3>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white/80 border border-slate-200 text-slate-700">
                  {totalYes} Ya / {totalQuestions} Pertanyaan
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {result === 'sesuai' && 'Hebat! Perkembangan anak berkembang sangat baik sesuai tahapan usianya. Lanjutkan stimulasi harian dengan penuh kasih sayang.'}
                {result === 'meragukan' && 'Perkembangan anak memerlukan perhatian ekstra. Berikan stimulasi intensif selama 2 minggu pada kemampuan yang belum dicapai, lalu lakukan skrining KPSP ulang.'}
                {result === 'penyimpangan' && 'Terdapat beberapa indikasi keterlambatan perkembangan. Disarankan membawa anak ke Dokter Spesialis Anak (Sp.A) atau Puskesmas untuk evaluasi tumbuh kembang komprehensif.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Catatan Skrining</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <p className="text-xs text-emerald-700 font-semibold mt-3 pt-2 border-t border-emerald-200/60">
            Catatan skrining KPSP berhasil disimpan ke rekap Buku KIA!
          </p>
        )}
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Daftar Pertanyaan KPSP Usia {currentGroup.ageMonths} Bulan
          </h3>
          <span className="text-xs text-slate-500">Tanyakan & Uji Bersama Anak</span>
        </div>

        <div className="divide-y divide-slate-100">
          {currentGroup.questions.map((q, idx) => {
            const aspect = getAspectBadge(q.aspect);
            const isYes = answers[q.id] === true;

            return (
              <div key={q.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 font-mono">#{idx + 1}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${aspect.color}`}>
                        {aspect.label}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {q.question}
                    </p>
                    {q.instruction && (
                      <p className="text-xs text-slate-500 italic">
                        Cara menguji: {q.instruction}
                      </p>
                    )}
                  </div>

                  {/* Yes / No Toggle Buttons */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => toggleAnswer(q.id, true)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        isYes
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Bisa / Ya
                    </button>
                    <button
                      onClick={() => toggleAnswer(q.id, false)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                        !isYes
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      Belum / Tidak
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stimulation Suggestions */}
      <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-600" />
          <h4 className="text-sm font-bold text-amber-950">Panduan Stimulasi Harian Anak</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="bg-white p-3.5 rounded-lg border border-amber-200/70">
            <p className="font-bold text-slate-900 mb-1">Stimulasi Bicara & Bahasa</p>
            <p className="text-slate-600 leading-relaxed">
              Sering ajak anak mengobrol dengan tatap mata, sebutkan nama benda nyata dengan artikulasi jelas, bacakan buku cerita bergambar, dan hindari paparan screen time gadget di bawah usia 2 tahun.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-amber-200/70">
            <p className="font-bold text-slate-900 mb-1">Stimulasi Motorik & Mandiri</p>
            <p className="text-slate-600 leading-relaxed">
              Beri ruang aman untuk merangkak, berjalan, bermain lempar bola empuk, menyusun balok kayu, serta latih memegang sendok dan minum dari cangkir secara bertahap.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
