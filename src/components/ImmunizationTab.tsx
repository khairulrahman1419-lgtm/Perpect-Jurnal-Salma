import React, { useState } from 'react';
import { ChildProfile, VaccineLog } from '../types';
import { VACCINE_SCHEDULE } from '../data/vaccineData';
import { calculateAgeInMonths } from '../utils/whoStandards';
import { ShieldCheck, Calendar, CheckCircle2, Clock, AlertCircle, Syringe, Plus } from 'lucide-react';

interface ImmunizationTabProps {
  child: ChildProfile;
  vaccineLogs: VaccineLog[];
  onUpdateVaccineLog: (log: VaccineLog) => void;
}

export const ImmunizationTab: React.FC<ImmunizationTabProps> = ({
  child,
  vaccineLogs,
  onUpdateVaccineLog,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'upcoming'>('all');
  const [activeModalVaccineId, setActiveModalVaccineId] = useState<string | null>(null);

  // Form states for marking a vaccine
  const [dateGiven, setDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('Puskesmas / Posyandu');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const age = calculateAgeInMonths(child.birthDate);

  const completedCount = vaccineLogs.filter(v => v.status === 'completed').length;
  const totalCount = VACCINE_SCHEDULE.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  const handleSaveVaccine = (vaccineId: string) => {
    const newLog: VaccineLog = {
      id: `vlog_${vaccineId}_${Date.now()}`,
      childId: child.id,
      vaccineId,
      dateGiven,
      location,
      batchNumber,
      notes,
      status: 'completed',
    };
    onUpdateVaccineLog(newLog);
    setActiveModalVaccineId(null);
    setNotes('');
    setBatchNumber('');
  };

  const handleToggleCompleted = (vaccineId: string, isCurrentlyCompleted: boolean) => {
    if (isCurrentlyCompleted) {
      // Toggle back to not completed
      const existing = vaccineLogs.find(v => v.vaccineId === vaccineId);
      if (existing) {
        onUpdateVaccineLog({ ...existing, status: 'missed' });
      }
    } else {
      // Open modal to record completion date
      setActiveModalVaccineId(vaccineId);
      setDateGiven(new Date().toISOString().split('T')[0]);
    }
  };

  // Filtered vaccines list
  const filteredSchedule = VACCINE_SCHEDULE.filter(v => {
    const isCompleted = vaccineLogs.some(log => log.vaccineId === v.id && log.status === 'completed');
    if (filter === 'completed') return isCompleted;
    if (filter === 'upcoming') return !isCompleted;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Progress & Overview Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-bold text-slate-900">Jadwal Imunisasi Lengkap IDAI & Kemenkes</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Lindungi Si Kecil dari penyakit berbahaya dengan imunisasi tepat waktu
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">Kelengkapan Vaksin:</span>
            <div className="text-lg font-extrabold text-sky-700 tabular-nums">
              {completedCount} / {totalCount} ({percentage}%)
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-sky-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
            <span>Usia anak saat ini: {age.display}</span>
            <span>Target: Imunisasi Dasar Lengkap (IDL) sebelum usia 1 tahun</span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semua Jadwal ({totalCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Sudah Diberikan ({completedCount})
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Mendatang / Belum ({totalCount - completedCount})
          </button>
        </div>
      </div>

      {/* Vaccines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSchedule.map((vac) => {
          const log = vaccineLogs.find(l => l.vaccineId === vac.id && l.status === 'completed');
          const isCompleted = !!log;
          const isDue = !isCompleted && age.months >= vac.recommendedAgeMonths;

          return (
            <div
              key={vac.id}
              className={`p-4 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-white border-emerald-200/80 shadow-2xs'
                  : isDue
                  ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {vac.ageDisplay}
                    </span>
                    {vac.isRequiredNational && (
                      <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                        Program Wajib Nasional
                      </span>
                    )}
                    {isDue && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        Waktunya Diberikan
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {vac.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Mencegah: {vac.targetDisease}
                  </p>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                    {vac.description}
                  </p>

                  {isCompleted && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-medium flex flex-wrap items-center gap-3">
                      <span>Diberikan: {log.dateGiven}</span>
                      {log.location && <span>Lokasi: {log.location}</span>}
                    </div>
                  )}
                </div>

                {/* Status Check Action */}
                <div className="shrink-0">
                  <button
                    onClick={() => handleToggleCompleted(vac.id, isCompleted)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Selesai</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Catat Imunisasi</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Vaccine Log Record Modal */}
      {activeModalVaccineId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Syringe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Catat Pemberian Vaksin</h3>
                  <p className="text-[11px] text-slate-400">
                    {VACCINE_SCHEDULE.find(v => v.id === activeModalVaccineId)?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalVaccineId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Diberikan *</label>
                <input
                  type="date"
                  value={dateGiven}
                  onChange={(e) => setDateGiven(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tempat / Fasilitas Kesehatan</label>
                <input
                  type="text"
                  placeholder="Misal: Posyandu Mawar / Puskesmas / RS"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Batch Vaksin (Opsional)</label>
                <input
                  type="text"
                  placeholder="Tertera pada stiker vial vaksin"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveModalVaccineId(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveVaccine(activeModalVaccineId)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
