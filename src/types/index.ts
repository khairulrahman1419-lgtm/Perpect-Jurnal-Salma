export type Gender = 'male' | 'female';

export interface ChildProfile {
  id: string;
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthWeight: number; // kg
  birthHeight: number; // cm
  birthHeadCircumference?: number; // cm
  bloodType?: string;
  parentName?: string;
  parentPhone?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  ageMonths: number;
  weight: number; // kg
  height: number; // cm
  headCircumference?: number; // cm
  notes?: string;
  location?: string; // Posyandu / Puskesmas / Rumah / RS
  // Calculated WHO / Kemenkes statuses
  status: {
    weightForAge: 'sangat_kurang' | 'kurang' | 'normal' | 'risiko_lebih';
    heightForAge: 'sangat_pendek' | 'pendek' | 'normal' | 'tinggi';
    weightForHeight: 'gizi_buruk' | 'gizi_kurang' | 'gizi_baik' | 'berisiko_lebih' | 'gizi_lebih' | 'obesitas';
    headForAge?: 'mikrosefali' | 'normal' | 'makrosefali';
  };
}

export interface KPSPQuestion {
  id: string;
  aspect: 'motorik_kasar' | 'motorik_halus' | 'bicara_bahasa' | 'sosialisasi_kemandirian';
  question: string;
  instruction?: string;
  toolsNeeded?: string;
}

export interface KPSPAgeGroup {
  ageMonths: number; // 3, 6, 9, 12, 15, 18, 21, 24, 30, 36, 42, 48, 54, 60, 66, 72
  title: string;
  questions: KPSPQuestion[];
}

export interface MilestoneTestRecord {
  id: string;
  childId: string;
  date: string;
  ageMonthsTested: number;
  answers: Record<string, boolean>; // questionId -> yes/no
  totalYes: number;
  totalNo: number;
  result: 'sesuai' | 'meragukan' | 'penyimpangan';
  evaluatorNotes?: string;
}

export interface VaccineInfo {
  id: string;
  name: string;
  shortName: string;
  targetDisease: string;
  recommendedAgeMonths: number;
  ageDisplay: string;
  doseNumber: number;
  totalDoses: number;
  isRequiredNational: boolean;
  description: string;
}

export interface VaccineLog {
  id: string;
  childId: string;
  vaccineId: string;
  dateGiven: string;
  status: 'completed' | 'scheduled' | 'missed';
  location?: string;
  batchNumber?: string;
  notes?: string;
}

export interface AIConsultMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface ChildMemory {
  id: string;
  childId: string;
  title: string;
  date: string; // YYYY-MM-DD
  ageDisplay: string; // e.g. "Usia 6 Bulan 17 Hari"
  weightAtMoment?: number; // kg
  heightAtMoment?: number; // cm
  mediaUrl: string; // base64 or asset path
  mediaType: 'image' | 'video';
  caption?: string;
  tags?: string[];
  isPolaroidFavorite?: boolean;
  category?: 'milestone' | 'daily' | 'family' | 'mpasi' | 'first_time';
  driveFileId?: string;
  driveLink?: string;
  storagePath?: string;
}

