import React, { useState } from 'react';
import { ChildProfile, GrowthRecord } from '../types';
import { MessageCircleQuestion, Sparkles, Send, X, ArrowRight, User, Stethoscope, HelpCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface FloatingDoctorAIWidgetProps {
  child: ChildProfile;
  latestRecord?: GrowthRecord;
  onNavigateToDoctorConsult: () => void;
}

interface QuickFAQ {
  id: string;
  question: string;
  category: string;
  icon: string;
}

const QUICK_FAQS: QuickFAQ[] = [
  {
    id: 'bb_seret',
    question: 'Berat badan anak tidak naik bulan ini, apa evaluasi dokter?',
    category: 'Pertumbuhan',
    icon: '⚖️',
  },
  {
    id: 'gtm_tips',
    question: 'Anak sedang GTM (Gerakan Tutup Mulut) & susah makan, tips praktisnya bagaimana Dok?',
    category: 'Nutrisi MPASI',
    icon: '🥣',
  },
  {
    id: 'kapan_ke_dokter',
    question: 'Kapan demam dan batuk anak harus segera dibawa ke IGD / Dokter Spesialis Anak?',
    category: 'Tanda Bahaya',
    icon: '🚨',
  },
  {
    id: 'jadwal_mpasi',
    question: 'Berapa takaran protein hewani dan jadwal makan harian ideal untuk balita?',
    category: 'Gizi & Nutrisi',
    icon: '🍗',
  },
  {
    id: 'bicara_motorik',
    question: 'Bagaimana stimulasi harian untuk perkembangan bicara dan motorik anak?',
    category: 'Stimulasi KPSP',
    icon: '🗣️',
  },
];

export const FloatingDoctorAIWidget: React.FC<FloatingDoctorAIWidgetProps> = ({
  child,
  latestRecord,
  onNavigateToDoctorConsult,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState<string | null>(null);
  const [selectedFaqQuestion, setSelectedFaqQuestion] = useState<string | null>(null);

  const handleAsk = async (questionText: string) => {
    if (!questionText.trim()) return;
    setIsLoading(true);
    setActiveResponse(null);
    setSelectedFaqQuestion(questionText);

    try {
      const res = await fetch('/api/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: questionText,
          childContext: {
            name: child.name,
            gender: child.gender,
            birthDate: child.birthDate,
            weight: latestRecord?.weight,
            height: latestRecord?.height,
            ageDisplay: latestRecord ? `${latestRecord.ageMonths} Bulan` : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal berkonsultasi dengan Dokter AI');
      }
      setActiveResponse(data.reply);
      setInputQuestion('');
    } catch (err: any) {
      setActiveResponse(`Maaf, terjadi kendala: ${err.message || 'Coba tanyakan kembali.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* 1. Translucent Floating Button (Bottom-Right, always accessible, non-intrusive) */}
      <div className="fixed bottom-20 right-4 sm:bottom-22 sm:right-6 z-40 no-print animate-in fade-in duration-300">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-white/85 hover:bg-white text-teal-950 backdrop-blur-md border border-teal-300/80 shadow-lg hover:shadow-xl transition-all active:scale-95 cursor-pointer ring-4 ring-teal-500/10"
          title="Tanya Dokter Anak AI & FAQ Tumbuh Kembang"
        >
          {/* Pulsing indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>

          {/* Stethoscope Icon */}
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Stethoscope className="w-3.5 h-3.5" />
          </div>

          <div className="text-left">
            <p className="text-[11px] font-extrabold text-slate-900 leading-tight">
              Tanya dr. AI
            </p>
            <p className="text-[9px] font-bold text-teal-700 leading-none">
              FAQ & Konsultasi
            </p>
          </div>
        </button>
      </div>

      {/* 2. Glassmorphic Floating Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white/95 backdrop-blur-md w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-teal-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white p-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/20 border border-white/30 flex items-center justify-center">
                    <img
                      src="/src/assets/images/pediatrician_dr_avatar_1792637535557.jpg"
                      alt="Dr. Sari Rahmawati Sp.A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-teal-800 flex items-center justify-center" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>Dr. Sari Rahmawati, Sp.A</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[11px] text-teal-100">
                    Dokter Spesialis Anak AI · Konsultasi Cepat
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-slate-800 text-xs">
              {/* Context Child Banner */}
              <div className="bg-teal-50/80 border border-teal-200/70 rounded-xl p-2.5 flex items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-teal-900 font-semibold">
                  <User className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>
                    Pasien: <strong>{child.name}</strong> ({child.gender === 'female' ? 'Perempuan' : 'Laki-laki'})
                  </span>
                </div>
                {latestRecord && (
                  <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-teal-200 text-teal-800 font-bold">
                    BB: {latestRecord.weight} kg
                  </span>
                )}
              </div>

              {/* If no active response, show FAQ question list */}
              {!activeResponse && !isLoading && (
                <div className="space-y-2.5">
                  <p className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Pertanyaan Populer & FAQ Orang Tua:</span>
                  </p>
                  <div className="space-y-2">
                    {QUICK_FAQS.map((faq) => (
                      <button
                        key={faq.id}
                        onClick={() => handleAsk(faq.question)}
                        className="w-full text-left p-3 rounded-2xl bg-white hover:bg-teal-50/70 border border-stone-200/80 hover:border-teal-300 text-slate-800 transition-all cursor-pointer shadow-2xs group flex items-start gap-2.5"
                      >
                        <span className="text-sm shrink-0 mt-0.5">{faq.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-teal-900 leading-snug">
                            {faq.question}
                          </p>
                          <span className="text-[10px] text-teal-700 font-bold inline-block mt-0.5">
                            {faq.category} · Tanya Langsung →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs">
                      Dr. Sari sedang menyusun jawaban medis...
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Berbasis standar IDAI, WHO, dan data tumbuh kembang {child.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Response Display */}
              {activeResponse && !isLoading && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="bg-teal-50/70 rounded-2xl p-3.5 border border-teal-200">
                    <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1">
                      Pertanyaan:
                    </p>
                    <p className="font-bold text-slate-900 italic">
                      "{selectedFaqQuestion}"
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-bold text-teal-950 text-xs">
                        Jawaban Dr. Sari Rahmawati, Sp.A:
                      </span>
                    </div>
                    <div className="prose prose-stone text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                      {activeResponse}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveResponse(null);
                        setSelectedFaqQuestion(null);
                      }}
                      className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                    >
                      ← Pilih Pertanyaan Lain
                    </button>

                    <button
                      onClick={() => {
                        setIsOpen(false);
                        onNavigateToDoctorConsult();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-black text-white bg-teal-700 hover:bg-teal-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <span>Ruang Konsultasi Penuh</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Input Bar at Bottom */}
            <div className="p-3 bg-stone-50 border-t border-stone-200/80 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk(inputQuestion);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  placeholder="Ketik pertanyaan lain untuk dr. AI..."
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputQuestion.trim()}
                  className="w-8 h-8 rounded-xl bg-teal-700 hover:bg-teal-800 text-white flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Jawaban AI berbasis panduan IDAI & WHO</span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToDoctorConsult();
                  }}
                  className="text-teal-700 font-bold hover:underline cursor-pointer"
                >
                  Buka Chat Dokter Penuh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
