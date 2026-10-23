import React from 'react';
import { ChildProfile, GrowthRecord, VaccineLog } from '../types';
import { VACCINE_SCHEDULE } from '../data/vaccineData';
import { calculateAgeInMonths, getWeightForAgeLabel, getHeightForAgeLabel } from '../utils/whoStandards';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';

interface KIAReportModalProps {
  child: ChildProfile;
  records: GrowthRecord[];
  vaccineLogs: VaccineLog[];
  onClose: () => void;
}

export const KIAReportModal: React.FC<KIAReportModalProps> = ({
  child,
  records,
  vaccineLogs,
  onClose,
}) => {
  const age = calculateAgeInMonths(child.birthDate);
  const sortedRecords = [...records].sort((a, b) => a.ageMonths - b.ageMonths);
  const latest = sortedRecords[sortedRecords.length - 1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Actions (no-print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 no-print mb-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              Rekapitulasi Tumbuh Kembang & Buku KIA Digital
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="printable-report space-y-6 text-slate-800">
          {/* Header Posyandu / Faskes style */}
          <div className="text-center pb-4 border-b-2 border-slate-800">
            <h1 className="text-xl font-extrabold tracking-wider text-slate-900 uppercase">
              KARTU MENUJU SEHAT (KMS) & CATATAN TUMBUH KEMBANG
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Berdasarkan Standar Baku Antropometri Kemenkes RI & WHO Child Growth Standards
            </p>
          </div>

          {/* Child Identity Card */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500">Nama Lengkap Anak:</p>
              <p className="font-bold text-sm text-slate-900">{child.name}</p>
            </div>
            <div>
              <p className="text-slate-500">Jenis Kelamin:</p>
              <p className="font-bold text-sm text-slate-900">
                {child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Tanggal Lahir / Usia:</p>
              <p className="font-bold text-slate-900">{child.birthDate} ({age.display})</p>
            </div>
            <div>
              <p className="text-slate-500">Kondisi Lahir:</p>
              <p className="font-bold text-slate-900">
                BB {child.birthWeight} kg · TB {child.birthHeight} cm {child.birthHeadCircumference ? `· LK ${child.birthHeadCircumference} cm` : ''}
              </p>
            </div>
            {child.parentName && (
              <div className="col-span-2">
                <p className="text-slate-500">Nama Orang Tua / Pengasuh:</p>
                <p className="font-bold text-slate-900">{child.parentName} {child.parentPhone ? `(${child.parentPhone})` : ''}</p>
              </div>
            )}
          </div>

          {/* Latest Status Assessment */}
          {latest && (
            <div className="p-4 border border-emerald-200 bg-emerald-50/50 rounded-xl">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                Status Antropometri Terakhir ({latest.date} / Usia {latest.ageMonths} Bulan)
              </h3>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">BB/U:</span>
                  <p className="font-bold text-slate-900">{latest.weight} kg ({getWeightForAgeLabel(latest.status.weightForAge).text})</p>
                </div>
                <div>
                  <span className="text-slate-500">TB/U:</span>
                  <p className="font-bold text-slate-900">{latest.height} cm ({getHeightForAgeLabel(latest.status.heightForAge).text})</p>
                </div>
                <div>
                  <span className="text-slate-500">BB/TB:</span>
                  <p className="font-bold text-slate-900">{latest.status.weightForHeight.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Table of Monthly Measurements */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Daftar Riwayat Penimbangan & Pengukuran
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 divide-y divide-slate-200">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-2">Tgl</th>
                  <th className="p-2">Usia</th>
                  <th className="p-2 text-right">BB (kg)</th>
                  <th className="p-2 text-right">TB (cm)</th>
                  <th className="p-2 text-right">LK (cm)</th>
                  <th className="p-2">Status BB/U</th>
                  <th className="p-2">Faskes / Posyandu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedRecords.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 font-mono">{r.date}</td>
                    <td className="p-2 font-mono">{r.ageMonths} bln</td>
                    <td className="p-2 font-mono text-right font-bold">{r.weight}</td>
                    <td className="p-2 font-mono text-right font-bold">{r.height}</td>
                    <td className="p-2 font-mono text-right">{r.headCircumference || '-'}</td>
                    <td className="p-2">{getWeightForAgeLabel(r.status.weightForAge).text}</td>
                    <td className="p-2 text-slate-500">{r.location || 'Posyandu'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vaccine Immunization Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Status Kelengkapan Imunisasi
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {VACCINE_SCHEDULE.slice(0, 12).map((vac) => {
                const log = vaccineLogs.find(l => l.vaccineId === vac.id && l.status === 'completed');
                return (
                  <div key={vac.id} className="flex items-center justify-between p-2 rounded border border-slate-100 bg-slate-50/50">
                    <span className="font-medium text-slate-800">{vac.name}</span>
                    <span className={`font-mono text-[11px] ${log ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                      {log ? `✓ (${log.dateGiven})` : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
            <p>Dicetak melalui Aplikasi TumbuhKembang KMS Digital</p>
            <p>Tanda Tangan Petugas / Dokter: ___________________</p>
          </div>
        </div>
      </div>
    </div>
  );
};
