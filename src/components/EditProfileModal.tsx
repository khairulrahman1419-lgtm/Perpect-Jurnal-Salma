import React, { useState, useRef } from 'react';
import { ChildProfile } from '../types';
import { Camera, Image as ImageIcon, Baby, User, Calendar, Save, X, Sparkles, Loader2 } from 'lucide-react';
import { ClothespinClip } from './ClothespinClip';
import { uploadMediaFile, saveOnlineChild } from '../services/apiService';

interface EditProfileModalProps {
  child: ChildProfile;
  onClose: () => void;
  onSaveChild: (updatedChild: ChildProfile) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  child,
  onClose,
  onSaveChild,
}) => {
  const [name, setName] = useState(child.name);
  const [gender, setGender] = useState<'male' | 'female'>(child.gender);
  const [birthDate, setBirthDate] = useState(child.birthDate);
  const [parentName, setParentName] = useState(child.parentName || 'Ayah Rahman');
  const [parentPhone, setParentPhone] = useState(child.parentPhone || '');
  const [bloodType, setBloodType] = useState(child.bloodType || 'A+');
  const [birthWeight, setBirthWeight] = useState(child.birthWeight?.toString() || '3.2');
  const [birthHeight, setBirthHeight] = useState(child.birthHeight?.toString() || '49.0');
  const [birthHeadCircumference, setBirthHeadCircumference] = useState(
    child.birthHeadCircumference?.toString() || '34.0'
  );
  const [notes, setNotes] = useState(child.notes || '');
  const [photoUrl, setPhotoUrl] = useState(child.photoUrl || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show temporary local object preview right away
    setPhotoUrl(URL.createObjectURL(file));
    setIsUploadingPhoto(true);

    try {
      const uploadRes = await uploadMediaFile(file);
      setPhotoUrl(uploadRes.url);
    } catch (err) {
      console.error('Gagal upload foto profil ke cloud:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !birthDate) return;

    setIsSaving(true);
    const updated: ChildProfile = {
      ...child,
      name,
      gender,
      birthDate,
      parentName,
      parentPhone,
      bloodType,
      birthWeight: parseFloat(birthWeight) || 3.2,
      birthHeight: parseFloat(birthHeight) || 49.0,
      birthHeadCircumference: parseFloat(birthHeadCircumference) || 34.0,
      notes,
      photoUrl,
    };

    try {
      await saveOnlineChild(updated);
    } catch (err) {
      console.warn('Gagal simpan ke online backend:', err);
    }

    setIsSaving(false);
    onSaveChild(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 my-6 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Aesthetic Clothespin Clip on top of modal */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
          <ClothespinClip color="wood" rotation={2} size="lg" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ubah Biodata & Foto Anak</h3>
              <p className="text-xs text-slate-500">Edit profil dan data kelahiran si kecil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Photo Section */}
          <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-stone-200">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs flex items-center justify-center">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                ) : (
                  <Baby className="w-10 h-10 text-stone-300" />
                )}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold text-slate-800">Foto Profil Buah Hati</p>
              <p className="text-[11px] text-slate-500 mb-2">Pilih foto dari galeri atau ambil langsung</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Galeri</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Kamera</span>
                </button>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {/* Child Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Anak *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Salma Nur Khalisa"
              className="w-full text-xs px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-semibold text-slate-900"
            />
          </div>

          {/* Gender & BirthDate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenis Kelamin *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full text-xs px-3 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
              >
                <option value="female">Perempuan (Merah Muda)</option>
                <option value="male">Laki-laki (Biru)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Parent Name & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Orang Tua (Ayah/Ibu)
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Misal: Ayah Rahman"
                className="w-full text-xs px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Golongan Darah
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O+">O+</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Birth Weight & Height */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Berat Lahir (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Panjang Lahir (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={birthHeight}
                onChange={(e) => setBirthHeight(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                LK Lahir (cm)
              </label>
              <input
                type="number"
                step="0.1"
                value={birthHeadCircumference}
                onChange={(e) => setBirthHeadCircumference(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus / Riwayat Kelahiran
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: ASI eksklusif, imunisasi lengkap, riwayat alergi makanan..."
              className="w-full text-xs px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingPhoto}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {(isSaving || isUploadingPhoto) ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isUploadingPhoto ? 'Mengunggah Foto...' : isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
