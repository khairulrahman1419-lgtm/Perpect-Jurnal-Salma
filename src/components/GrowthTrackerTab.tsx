import React, { useState } from 'react';
import { ChildProfile, GrowthRecord } from '../types';
import { KMSChart } from './KMSChart';
import {
  evaluateGrowthStatus,
  calculateAgeInMonths,
  getWeightForAgeLabel,
  getHeightForAgeLabel,
  getWeightForHeightLabel
} from '../utils/whoStandards';
import { Plus, Sparkles, Scale, AlertCircle, CheckCircle2, Trash2, Calendar, MapPin, Loader2 } from 'lucide-react';

interface GrowthTrackerTabProps {
  child: ChildProfile;
  records: GrowthRecord[];
  onAddRecord: (record: GrowthRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const GrowthTrackerTab: React.FC<GrowthTrackerTabProps> = ({
  child,
  records,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form states
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState<string>('9.8');
  const [height, setHeight] = useState<string>('78.0');
  const [headCirc, setHeadCirc] = useState<string>('46.0');
  const [location, setLocation] = useState<string>('Posyandu Mawar');
  const [notes, setNotes] = useState<string>('');

  const sortedRecords = [...records].sort((a, b) => a.ageMonths - b.ageMonths);
  const latestRecord = sortedRecords[sortedRecords.length - 1];

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const hc = headCirc ? parseFloat(headCirc) : undefined;

    if (!w || !h || isNaN(w) || isNaN(h)) return;

    const ageCalc = calculateAgeInMonths(child.birthDate, measurementDate);
    const status = evaluateGrowthStatus(child.gender, ageCalc.months, w, h, hc);

    const newRecord: GrowthRecord = {
      id: `rec_${Date.now()}`,
      childId: child.id,
      date: measurementDate,
      ageMonths: ageCalc.months,
      weight: w,
      height: h,
      headCircumference: hc,
      location,
      notes,
      status,
    };

    onAddRecord(newRecord);
    setIsModalOpen(false);
    setNotes('');
  };

  const handleRunAiAnalysis = async () => {
    if (!latestRecord) return;
    setIsAnalyzing(true);
    setAiError(null);
    setAiAnalysisResult(null);

    try {
      const res = await fetch('/api/ai/growth-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child,
          latestRecord,
          previousRecords: sortedRecords.slice(0, -1),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memproses analisis');
      }

      setAiAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Terjadi kesalahan saat meminta evaluasi AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const wLabel = latestRecord ? getWeightForAgeLabel(latestRecord.status.weightForAge) : null;
  const hLabel = latestRecord ? getHeightForAgeLabel(latestRecord.status.heightForAge) : null;
  const gLabel = latestRecord ? getWeightForHeightLabel(latestRecord.status.weightForHeight) : null;

  return (
    <div className="space-y-6">
      {/* Top Action & Status Alert */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pemantauan Antropometri & Kurva KMS</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi Z-Score Berat Badan (BB/U), Tinggi Badan (TB/U), dan Gizi (BB/TB) Standar Kemenkes RI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing || !latestRecord}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Konsultasi AI Pertumbuhan</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-sky-600 hover:bg-sky-700 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Pengukuran</span>
          </button>
        </div>
      </div>

      {/* 3 Status Cards (Permenkes 2020) */}
      {latestRecord && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* BB / U */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">BB / Umur (BB/U)</span>
              <span className="text-xs font-mono font-bold text-slate-900">{latestRecord.weight} kg</span>
            </div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-md border ${wLabel?.color}`}>
              {wLabel?.text}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Indikator berat badan umum menurut usia anak.
            </p>
          </div>

          {/* TB / U (Stunting Detector) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Tinggi / Umur (TB/U)</span>
              <span className="text-xs font-mono font-bold text-slate-900">{latestRecord.height} cm</span>
            </div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-md border ${hLabel?.color}`}>
              {hLabel?.text}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Indikator utama deteksi dini stunting dan pertumbuhan linier tulang.
            </p>
          </div>

          {/* BB / TB (Status Gizi / Wasting) */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">BB / TB (Status Gizi)</span>
              <span className="text-xs font-mono font-bold text-slate-900">{latestRecord.status.weightForHeight.replace('_', ' ')}</span>
            </div>
            <div className={`text-xs font-medium px-2.5 py-1 rounded-md border ${gLabel?.color}`}>
              {gLabel?.text}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Indikator gizi akut: mendeteksi kondisi gizi buruk / wasting / obesitas.
            </p>
          </div>
        </div>
      )}

      {/* AI Growth Analysis Result Banner */}
      {aiAnalysisResult && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 rounded-xl border border-indigo-100 p-6 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-3 border-b border-indigo-100/60 mb-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-indigo-950">Analisis Tumbuh Kembang AI Dokter Spesialis Anak</h3>
              <p className="text-[11px] text-indigo-600">Evaluasi berbasis Kurva WHO & Standar Gizi Kemenkes RI</p>
            </div>
          </div>
          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {aiAnalysisResult}
          </div>
        </div>
      )}

      {aiError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* KMS Chart Component */}
      <KMSChart child={child} records={records} />

      {/* Historical Measurements Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">Riwayat Catatan Pengukuran</h3>
            <span className="text-xs text-slate-500 font-mono">({sortedRecords.length} kali)</span>
          </div>
          <p className="text-xs text-slate-400">Rutin ukur tiap bulan di Posyandu / Faskes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Usia</th>
                <th className="px-4 py-3 text-right">Berat (kg)</th>
                <th className="px-4 py-3 text-right">Tinggi (cm)</th>
                <th className="px-4 py-3 text-right">LK (cm)</th>
                <th className="px-4 py-3">Status BB/U</th>
                <th className="px-4 py-3">Status TB/U</th>
                <th className="px-4 py-3">Lokasi / Catatan</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.map((r) => {
                const w = getWeightForAgeLabel(r.status.weightForAge);
                const h = getHeightForAgeLabel(r.status.heightForAge);

                return (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{r.date}</td>
                    <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">{r.ageMonths} bln</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 text-right">{r.weight}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900 text-right">{r.height}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 text-right">{r.headCircumference || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${w.color}`}>
                        {w.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${h.color}`}>
                        {h.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                      <span className="font-medium text-slate-700">{r.location || 'Posyandu'}</span>
                      {r.notes ? ` · ${r.notes}` : ''}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onDeleteRecord(r.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Hapus catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Measurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Catat Pengukuran Baru</h3>
                  <p className="text-[11px] text-slate-400">Untuk {child.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMeasurement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Pengukuran *</label>
                <input
                  type="date"
                  required
                  value={measurementDate}
                  onChange={(e) => setMeasurementDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Badan (kg) *</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1"
                    max="50"
                    required
                    placeholder="Contoh: 9.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Gunakan timbangan bayi telanjang/pakaian tipis</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tinggi / Panjang (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="140"
                    required
                    placeholder="Contoh: 76.5"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">&lt; 2 thn diukur telentang (panjang)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lingkar Kepala (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="25"
                    max="65"
                    placeholder="Contoh: 45.2"
                    value={headCirc}
                    onChange={(e) => setHeadCirc(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Pengukuran</label>
                  <input
                    type="text"
                    placeholder="Posyandu / Puskesmas / Rumah"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Nafsu makan baik, baru sembuh batuk, atau mulai tumbuh gigi seri atas..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                >
                  Simpan ke KMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
