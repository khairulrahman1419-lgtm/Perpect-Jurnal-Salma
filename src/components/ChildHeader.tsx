import React, { useState } from 'react';
import { ChildProfile, GrowthRecord } from '../types';
import { calculateAgeInMonths } from '../utils/whoStandards';
import { Baby, Calendar, Scale, Ruler, Plus, Sparkles, Printer } from 'lucide-react';

interface ChildHeaderProps {
  childrenList: ChildProfile[];
  activeChild: ChildProfile;
  latestRecord?: GrowthRecord;
  onSelectChild: (child: ChildProfile) => void;
  onAddChild: (child: ChildProfile) => void;
  onOpenReportModal: () => void;
}

export const ChildHeader: React.FC<ChildHeaderProps> = ({
  childrenList,
  activeChild,
  latestRecord,
  onSelectChild,
  onAddChild,
  onOpenReportModal,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'female' as 'male' | 'female',
    birthDate: '',
    birthWeight: 3.2,
    birthHeight: 49.0,
    parentName: '',
    notes: '',
  });

  const age = calculateAgeInMonths(activeChild.birthDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDate) return;

    const newChild: ChildProfile = {
      id: `child_${Date.now()}`,
      name: formData.name,
      gender: formData.gender,
      birthDate: formData.birthDate,
      birthWeight: Number(formData.birthWeight),
      birthHeight: Number(formData.birthHeight),
      parentName: formData.parentName,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    onAddChild(newChild);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      gender: 'female',
      birthDate: '',
      birthWeight: 3.2,
      birthHeight: 49.0,
      parentName: '',
      notes: '',
    });
  };

  return (
    <div className="relative mb-6">
      {/* Hero Banner with clean typography and warm family photo */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[220px]">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold tracking-wide text-sky-700 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-md">
                  Kemenkes RI & WHO Standards
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-medium">
                  KMS Digital & Deteksi Stunting
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Tumbuh Kembang Si Kecil
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
                Pantau kurva berat & tinggi badan berkala, skrining perkembangan KPSP, jadwal imunisasi lengkap, panduan MPASI gizi seimbang, dan konsultasi dokter anak AI.
              </p>
            </div>

            {/* Child Switcher & Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="child-select" className="text-xs font-medium text-slate-500">
                  Profil Aktif:
                </label>
                <select
                  id="child-select"
                  value={activeChild.id}
                  onChange={(e) => {
                    const selected = childrenList.find(c => c.id === e.target.value);
                    if (selected) onSelectChild(selected);
                  }}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                >
                  {childrenList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gender === 'male' ? 'Laki-laki' : 'Perempuan'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  title="Tambah profil anak baru"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anak</span>
                </button>
              </div>

              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Cetak Rekap KIA</span>
              </button>
            </div>
          </div>

          {/* Right Hero Visual Banner */}
          <div className="lg:col-span-5 relative hidden lg:block overflow-hidden bg-slate-100">
            <img
              src="/src/assets/images/tumbuh_kembang_hero_1792637535336.jpg"
              alt="Keluarga hangat dan anak balita bermain balok edukatif"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent w-20" />
          </div>
        </div>
      </div>

      {/* Active Child Summary Pill Bar / Key Cards */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Usia */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-medium text-slate-500">Usia Sekarang</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900">
            {age.display}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Lahir: {activeChild.birthDate}
          </p>
        </div>

        {/* Berat Badan Terakhir */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-slate-500">Berat Badan</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
            {latestRecord ? `${latestRecord.weight} kg` : `${activeChild.birthWeight} kg (lahir)`}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {latestRecord ? `Update: ${latestRecord.date}` : 'Saat lahir'}
          </p>
        </div>

        {/* Tinggi Badan Terakhir */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Ruler className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-slate-500">Tinggi / Panjang</span>
          </div>
          <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
            {latestRecord ? `${latestRecord.height} cm` : `${activeChild.birthHeight} cm (lahir)`}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {latestRecord?.headCircumference ? `LK: ${latestRecord.headCircumference} cm` : 'Tinggi terkini'}
          </p>
        </div>

        {/* Status Stunting / WHO */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-slate-500">Status Pertumbuhan</span>
          </div>
          <div className="text-sm font-bold text-emerald-700 truncate">
            {latestRecord ? (
              latestRecord.status.heightForAge === 'normal'
                ? 'Normal (Bebas Stunting)'
                : latestRecord.status.heightForAge === 'pendek'
                ? 'Perlu Perhatian (Pendek)'
                : 'Sesuai Standar'
            ) : 'Normal'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {latestRecord ? `BB/TB: ${latestRecord.status.weightForHeight.replace('_', ' ')}` : 'Standar Kemenkes RI'}
          </p>
        </div>
      </div>

      {/* Add New Child Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Baby className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Tambah Profil Anak</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Anak *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Muhammad Rayhan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  >
                    <option value="male">Laki-laki (Biru)</option>
                    <option value="female">Perempuan (Merah Muda)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Lahir (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formData.birthWeight}
                    onChange={(e) => setFormData({ ...formData, birthWeight: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang Lahir (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="70"
                    value={formData.birthHeight}
                    onChange={(e) => setFormData({ ...formData, birthHeight: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Orang Tua</label>
                <input
                  type="text"
                  placeholder="Misal: Ayah Dimas & Ibu Rina"
                  value={formData.parentName}
                  onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                >
                  Simpan Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
