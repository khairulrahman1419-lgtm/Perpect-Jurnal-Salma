/**
 * Standar Antropometri Anak Kemenkes RI (Permenkes No. 2 Tahun 2020) & WHO Child Growth Standards
 */
import { Gender, GrowthRecord } from '../types';

export interface GrowthDataPoint {
  month: number;
  sd3neg: number; // -3 SD
  sd2neg: number; // -2 SD
  median: number; // 0 SD
  sd2pos: number; // +2 SD
  sd3pos: number; // +3 SD
}

// WHO Weight-for-age (BB/U) - Boys (Laki-laki) 0-60 bulan (kg)
export const WHO_WEIGHT_BOYS: GrowthDataPoint[] = [
  { month: 0, sd3neg: 2.1, sd2neg: 2.5, median: 3.3, sd2pos: 4.4, sd3pos: 5.0 },
  { month: 1, sd3neg: 2.9, sd2neg: 3.4, median: 4.5, sd2pos: 5.8, sd3pos: 6.6 },
  { month: 2, sd3neg: 3.8, sd2neg: 4.3, median: 5.6, sd2pos: 7.1, sd3pos: 8.0 },
  { month: 3, sd3neg: 4.4, sd2neg: 5.0, median: 6.4, sd2pos: 8.0, sd3pos: 9.0 },
  { month: 4, sd3neg: 4.9, sd2neg: 5.6, median: 7.0, sd2pos: 8.7, sd3pos: 9.7 },
  { month: 5, sd3neg: 5.3, sd2neg: 6.0, median: 7.5, sd2pos: 9.3, sd3pos: 10.4 },
  { month: 6, sd3neg: 5.7, sd2neg: 6.4, median: 7.9, sd2pos: 9.8, sd3pos: 10.9 },
  { month: 7, sd3neg: 5.9, sd2neg: 6.7, median: 8.3, sd2pos: 10.3, sd3pos: 11.4 },
  { month: 8, sd3neg: 6.2, sd2neg: 6.9, median: 8.6, sd2pos: 10.7, sd3pos: 11.9 },
  { month: 9, sd3neg: 6.4, sd2neg: 7.1, median: 8.9, sd2pos: 11.0, sd3pos: 12.3 },
  { month: 10, sd3neg: 6.6, sd2neg: 7.4, median: 9.2, sd2pos: 11.4, sd3pos: 12.7 },
  { month: 11, sd3neg: 6.8, sd2neg: 7.6, median: 9.4, sd2pos: 11.7, sd3pos: 13.0 },
  { month: 12, sd3neg: 6.9, sd2neg: 7.7, median: 9.6, sd2pos: 12.0, sd3pos: 13.3 },
  { month: 14, sd3neg: 7.2, sd2neg: 8.1, median: 10.1, sd2pos: 12.6, sd3pos: 14.0 },
  { month: 16, sd3neg: 7.5, sd2neg: 8.4, median: 10.5, sd2pos: 13.1, sd3pos: 14.6 },
  { month: 18, sd3neg: 7.8, sd2neg: 8.8, median: 10.9, sd2pos: 13.7, sd3pos: 15.3 },
  { month: 20, sd3neg: 8.1, sd2neg: 9.1, median: 11.3, sd2pos: 14.2, sd3pos: 15.9 },
  { month: 22, sd3neg: 8.4, sd2neg: 9.4, median: 11.8, sd2pos: 14.7, sd3pos: 16.5 },
  { month: 24, sd3neg: 8.6, sd2neg: 9.7, median: 12.2, sd2pos: 15.3, sd3pos: 17.1 },
  { month: 30, sd3neg: 9.4, sd2neg: 10.5, median: 13.3, sd2pos: 16.9, sd3pos: 19.0 },
  { month: 36, sd3neg: 10.0, sd2neg: 11.3, median: 14.3, sd2pos: 18.3, sd3pos: 20.7 },
  { month: 42, sd3neg: 10.6, sd2neg: 12.0, median: 15.3, sd2pos: 19.7, sd3pos: 22.4 },
  { month: 48, sd3neg: 11.2, sd2neg: 12.7, median: 16.3, sd2pos: 21.2, sd3pos: 24.2 },
  { month: 54, sd3neg: 11.8, sd2neg: 13.4, median: 17.3, sd2pos: 22.7, sd3pos: 26.2 },
  { month: 60, sd3neg: 12.4, sd2neg: 14.1, median: 18.3, sd2pos: 24.2, sd3pos: 27.9 },
];

// WHO Weight-for-age (BB/U) - Girls (Perempuan) 0-60 bulan (kg)
export const WHO_WEIGHT_GIRLS: GrowthDataPoint[] = [
  { month: 0, sd3neg: 2.0, sd2neg: 2.4, median: 3.2, sd2pos: 4.2, sd3pos: 4.8 },
  { month: 1, sd3neg: 2.7, sd2neg: 3.2, median: 4.2, sd2pos: 5.5, sd3pos: 6.2 },
  { month: 2, sd3neg: 3.4, sd2neg: 3.9, median: 5.1, sd2pos: 6.6, sd3pos: 7.5 },
  { month: 3, sd3neg: 4.0, sd2neg: 4.5, median: 5.8, sd2pos: 7.5, sd3pos: 8.5 },
  { month: 4, sd3neg: 4.4, sd2neg: 5.0, median: 6.4, sd2pos: 8.2, sd3pos: 9.3 },
  { month: 5, sd3neg: 4.8, sd2neg: 5.4, median: 6.9, sd2pos: 8.8, sd3pos: 10.0 },
  { month: 6, sd3neg: 5.1, sd2neg: 5.7, median: 7.3, sd2pos: 9.3, sd3pos: 10.6 },
  { month: 7, sd3neg: 5.3, sd2neg: 6.0, median: 7.6, sd2pos: 9.8, sd3pos: 11.1 },
  { month: 8, sd3neg: 5.6, sd2neg: 6.3, median: 7.9, sd2pos: 10.2, sd3pos: 11.6 },
  { month: 9, sd3neg: 5.8, sd2neg: 6.5, median: 8.2, sd2pos: 10.5, sd3pos: 12.0 },
  { month: 10, sd3neg: 5.9, sd2neg: 6.7, median: 8.5, sd2pos: 10.9, sd3pos: 12.4 },
  { month: 11, sd3neg: 6.1, sd2neg: 6.9, median: 8.7, sd2pos: 11.2, sd3pos: 12.8 },
  { month: 12, sd3neg: 6.3, sd2neg: 7.0, median: 8.9, sd2pos: 11.5, sd3pos: 13.1 },
  { month: 14, sd3neg: 6.6, sd2neg: 7.4, median: 9.4, sd2pos: 12.1, sd3pos: 13.8 },
  { month: 16, sd3neg: 6.9, sd2neg: 7.7, median: 9.8, sd2pos: 12.6, sd3pos: 14.5 },
  { month: 18, sd3neg: 7.2, sd2neg: 8.1, median: 10.2, sd2pos: 13.2, sd3pos: 15.2 },
  { month: 20, sd3neg: 7.5, sd2neg: 8.4, median: 10.6, sd2pos: 13.7, sd3pos: 15.8 },
  { month: 22, sd3neg: 7.8, sd2neg: 8.7, median: 11.0, sd2pos: 14.3, sd3pos: 16.5 },
  { month: 24, sd3neg: 8.1, sd2neg: 9.0, median: 11.5, sd2pos: 14.8, sd3pos: 17.1 },
  { month: 30, sd3neg: 8.8, sd2neg: 9.9, median: 12.7, sd2pos: 16.5, sd3pos: 19.1 },
  { month: 36, sd3neg: 9.6, sd2neg: 10.8, median: 13.9, sd2pos: 18.1, sd3pos: 21.2 },
  { month: 42, sd3neg: 10.3, sd2neg: 11.6, median: 15.0, sd2pos: 19.6, sd3pos: 23.1 },
  { month: 48, sd3neg: 10.9, sd2neg: 12.3, median: 16.1, sd2pos: 21.2, sd3pos: 25.0 },
  { month: 54, sd3neg: 11.5, sd2neg: 13.0, median: 17.2, sd2pos: 22.7, sd3pos: 27.0 },
  { month: 60, sd3neg: 12.1, sd2neg: 13.7, median: 18.2, sd2pos: 24.2, sd3pos: 28.8 },
];

// WHO Length/Height-for-age (TB/U) - Boys (cm)
export const WHO_HEIGHT_BOYS: GrowthDataPoint[] = [
  { month: 0, sd3neg: 44.2, sd2neg: 46.1, median: 49.9, sd2pos: 53.7, sd3pos: 55.6 },
  { month: 3, sd3neg: 55.6, sd2neg: 57.3, median: 61.4, sd2pos: 65.5, sd3pos: 67.6 },
  { month: 6, sd3neg: 61.2, sd2neg: 63.3, median: 67.6, sd2pos: 71.9, sd3pos: 74.0 },
  { month: 9, sd3neg: 65.2, sd2neg: 67.5, median: 72.0, sd2pos: 76.5, sd3pos: 78.7 },
  { month: 12, sd3neg: 68.6, sd2neg: 71.0, median: 75.7, sd2pos: 80.5, sd3pos: 82.9 },
  { month: 18, sd3neg: 74.2, sd2neg: 76.9, median: 82.3, sd2pos: 87.7, sd3pos: 90.4 },
  { month: 24, sd3neg: 78.7, sd2neg: 81.7, median: 87.8, sd2pos: 93.9, sd3pos: 97.0 },
  { month: 36, sd3neg: 86.5, sd2neg: 89.9, median: 96.1, sd2pos: 103.1, sd3pos: 106.5 },
  { month: 48, sd3neg: 93.1, sd2neg: 96.9, median: 103.3, sd2pos: 111.3, sd3pos: 115.2 },
  { month: 60, sd3neg: 98.7, sd2neg: 102.7, median: 110.0, sd2pos: 118.4, sd3pos: 122.8 },
];

// WHO Length/Height-for-age (TB/U) - Girls (cm)
export const WHO_HEIGHT_GIRLS: GrowthDataPoint[] = [
  { month: 0, sd3neg: 43.6, sd2neg: 45.4, median: 49.1, sd2pos: 52.9, sd3pos: 54.7 },
  { month: 3, sd3neg: 54.1, sd2neg: 55.8, median: 59.8, sd2pos: 63.8, sd3pos: 65.9 },
  { month: 6, sd3neg: 59.6, sd2neg: 61.6, median: 65.7, sd2pos: 70.0, sd3pos: 72.2 },
  { month: 9, sd3neg: 63.5, sd2neg: 65.6, median: 70.1, sd2pos: 74.7, sd3pos: 77.0 },
  { month: 12, sd3neg: 66.8, sd2neg: 69.1, median: 74.0, sd2pos: 78.9, sd3pos: 81.4 },
  { month: 18, sd3neg: 72.8, sd2neg: 75.4, median: 80.7, sd2pos: 86.4, sd3pos: 89.2 },
  { month: 24, sd3neg: 77.5, sd2neg: 80.3, median: 86.4, sd2pos: 92.5, sd3pos: 95.6 },
  { month: 36, sd3neg: 85.3, sd2neg: 88.7, median: 95.1, sd2pos: 102.2, sd3pos: 105.7 },
  { month: 48, sd3neg: 92.2, sd2neg: 96.0, median: 102.7, sd2pos: 110.5, sd3pos: 114.5 },
  { month: 60, sd3neg: 98.0, sd2neg: 102.0, median: 109.4, sd2pos: 117.8, sd3pos: 122.2 },
];

// Helper to calculate exact age in months between two dates
export function calculateAgeInMonths(birthDateStr: string, targetDateStr: string = new Date().toISOString().split('T')[0]): { months: number; days: number; totalMonthsFloat: number; display: string } {
  const birth = new Date(birthDateStr);
  const target = new Date(targetDateStr);

  let months = (target.getFullYear() - birth.getFullYear()) * 12 + (target.getMonth() - birth.getMonth());
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }

  const totalMonthsFloat = Math.max(0, Number((months + days / 30.44).toFixed(1)));
  
  let display = '';
  if (months === 0) {
    display = `${days} hari`;
  } else if (days === 0) {
    display = `${months} bulan`;
  } else {
    display = `${months} bln ${days} hr`;
  }

  return { months: Math.max(0, months), days: Math.max(0, days), totalMonthsFloat, display };
}

// Interpolate WHO values for any arbitrary month
function interpolateWHO(data: GrowthDataPoint[], month: number): GrowthDataPoint {
  if (month <= data[0].month) return data[0];
  if (month >= data[data.length - 1].month) return data[data.length - 1];

  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];
    if (month >= current.month && month <= next.month) {
      const ratio = (month - current.month) / (next.month - current.month);
      return {
        month,
        sd3neg: Number((current.sd3neg + ratio * (next.sd3neg - current.sd3neg)).toFixed(2)),
        sd2neg: Number((current.sd2neg + ratio * (next.sd2neg - current.sd2neg)).toFixed(2)),
        median: Number((current.median + ratio * (next.median - current.median)).toFixed(2)),
        sd2pos: Number((current.sd2pos + ratio * (next.sd2pos - current.sd2pos)).toFixed(2)),
        sd3pos: Number((current.sd3pos + ratio * (next.sd3pos - current.sd3pos)).toFixed(2)),
      };
    }
  }
  return data[0];
}

// Evaluasi Status Pertumbuhan berdasarkan Permenkes No. 2/2020
export function evaluateGrowthStatus(
  gender: Gender,
  ageMonths: number,
  weight: number,
  height: number,
  headCircumference?: number
): GrowthRecord['status'] {
  const weightData = gender === 'male' ? WHO_WEIGHT_BOYS : WHO_WEIGHT_GIRLS;
  const heightData = gender === 'male' ? WHO_HEIGHT_BOYS : WHO_HEIGHT_GIRLS;

  const wRef = interpolateWHO(weightData, ageMonths);
  const hRef = interpolateWHO(heightData, ageMonths);

  // 1. BB / U (Berat Badan menurut Umur)
  let weightForAge: GrowthRecord['status']['weightForAge'] = 'normal';
  if (weight < wRef.sd3neg) {
    weightForAge = 'sangat_kurang';
  } else if (weight < wRef.sd2neg) {
    weightForAge = 'kurang';
  } else if (weight <= wRef.sd2pos) {
    weightForAge = 'normal';
  } else {
    weightForAge = 'risiko_lebih';
  }

  // 2. TB / U (Tinggi Badan menurut Umur) -> Deteksi Stunting
  let heightForAge: GrowthRecord['status']['heightForAge'] = 'normal';
  if (height < hRef.sd3neg) {
    heightForAge = 'sangat_pendek'; // Severely stunted
  } else if (height < hRef.sd2neg) {
    heightForAge = 'pendek'; // Stunted
  } else if (height <= hRef.sd3pos) {
    heightForAge = 'normal';
  } else {
    heightForAge = 'tinggi';
  }

  // 3. BB / TB (Berat Badan menurut Tinggi Badan) -> Wasting & Obesitas
  // Perkiraan rasio BMI / proporsi BB terhadap TB
  const expectedWeightForHeight = (height / 100) * (height / 100) * 16.5; // Aproksimasi median z-score anak
  const weightRatio = weight / expectedWeightForHeight;

  let weightForHeight: GrowthRecord['status']['weightForHeight'] = 'gizi_baik';
  if (weightRatio < 0.70) {
    weightForHeight = 'gizi_buruk'; // Severely wasted
  } else if (weightRatio < 0.85) {
    weightForHeight = 'gizi_kurang'; // Wasted
  } else if (weightRatio <= 1.15) {
    weightForHeight = 'gizi_baik'; // Normal
  } else if (weightRatio <= 1.25) {
    weightForHeight = 'berisiko_lebih';
  } else if (weightRatio <= 1.35) {
    weightForHeight = 'gizi_lebih';
  } else {
    weightForHeight = 'obesitas';
  }

  // 4. Lingkar Kepala menurut Umur (Nellhaus / WHO)
  let headForAge: GrowthRecord['status']['headForAge'] = 'normal';
  if (headCircumference) {
    const expectedHead = 34 + ageMonths * 0.5; // general approximation
    if (headCircumference < expectedHead - 3) headForAge = 'mikrosefali';
    else if (headCircumference > expectedHead + 3) headForAge = 'makrosefali';
    else headForAge = 'normal';
  }

  return {
    weightForAge,
    heightForAge,
    weightForHeight,
    headForAge,
  };
}

// Label formatters for UI
export function getWeightForAgeLabel(status: GrowthRecord['status']['weightForAge']) {
  switch (status) {
    case 'sangat_kurang': return { text: 'Berat Badan Sangat Kurang', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'kurang': return { text: 'Berat Badan Kurang (Underweight)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'normal': return { text: 'Berat Badan Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'risiko_lebih': return { text: 'Risiko Berat Badan Lebih', color: 'text-purple-700 bg-purple-50 border-purple-200' };
  }
}

export function getHeightForAgeLabel(status: GrowthRecord['status']['heightForAge']) {
  switch (status) {
    case 'sangat_pendek': return { text: 'Sangat Pendek (Severely Stunted)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'pendek': return { text: 'Pendek (Stunted)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'normal': return { text: 'Tinggi Badan Normal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'tinggi': return { text: 'Tinggi', color: 'text-blue-700 bg-blue-50 border-blue-200' };
  }
}

export function getWeightForHeightLabel(status: GrowthRecord['status']['weightForHeight']) {
  switch (status) {
    case 'gizi_buruk': return { text: 'Gizi Buruk (Severely Wasted)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    case 'gizi_kurang': return { text: 'Gizi Kurang (Wasted)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'gizi_baik': return { text: 'Gizi Baik (Normal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    case 'berisiko_lebih': return { text: 'Berisiko Gizi Lebih', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    case 'gizi_lebih': return { text: 'Gizi Lebih (Overweight)', color: 'text-purple-700 bg-purple-50 border-purple-200' };
    case 'obesitas': return { text: 'Obesitas', color: 'text-rose-800 bg-rose-100 border-rose-300' };
  }
}
