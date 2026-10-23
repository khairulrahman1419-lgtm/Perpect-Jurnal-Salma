export interface MPASISchedule {
  stage: string;
  ageRange: string;
  texture: string;
  frequency: string;
  portion: string;
  keyRule: string;
  recommendedFoods: string[];
  sampleMenu: {
    mealTime: string;
    dish: string;
    composition: string;
  }[];
}

export const MPASI_STAGES: MPASISchedule[] = [
  {
    stage: 'Tahap 1: Pengenalan Makanan Padat',
    ageRange: '6 - 8 Bulan',
    texture: 'Bubur lumat kental / saring halus (puree / mashed). Tidak tumpah saat sendok dimiringkan.',
    frequency: '2 - 3 kali makanan utama + 1 - 2 kali makanan selingan (ASI tetap on demand).',
    portion: 'Mulai dari 2-3 sendok makan dewasa, tingkatkan bertahap hingga 1/2 mangkuk 250 ml (125 ml).',
    keyRule: 'Wajib mengandung Protein Hewani di setiap porsi untuk pencegahan stunting (IDAI). Lemak tambahan (minyak kelapa, butter, atau santan) sangat dianjurkan untuk kecukupan kalori.',
    recommendedFoods: [
      'Hati ayam kampung (sangat kaya zat besi & vitamin A)',
      'Telur ayam / telur puyuh (asam amino lengkap)',
      'Ikan kembung / lele / salmon (kaya Omega 3 & DHA)',
      'Daging ayam cincang & kaldu tulang',
      'Beras putih / kentang / ubi manis sebagai karbohidrat utama',
      'Santan murni / minyak kelapa / unsalted butter untuk sumber lemak'
    ],
    sampleMenu: [
      { mealTime: 'Pagi (07:00)', dish: 'Bubur Lumat Hati Ayam Santan', composition: 'Beras + Hati Ayam + Wortel + Santan matang' },
      { mealTime: 'Selingan (10:00)', dish: 'Puree Alpukat & ASI', composition: 'Alpukat mentega lumat + ASI perah' },
      { mealTime: 'Siang (12:30)', dish: 'Bubur Lumat Telur Puyuh Gurih', composition: 'Beras + Telur puyuh rebus lumat + Labu siam + UB' },
      { mealTime: 'Selingan (15:30)', dish: 'Puree Pisang Barangan Kukus', composition: 'Pisang kukus saring lembut' },
      { mealTime: 'Sore (18:00)', dish: 'Bubur Ikan Kembung Kuah Kuning', composition: 'Beras + Ikan kembung cincang halus + Buncis + Minyak kelapa' }
    ]
  },
  {
    stage: 'Tahap 2: Peningkatan Tekstur & Eksplorasi',
    ageRange: '9 - 11 Bulan',
    texture: 'Makanan dicincang halus (minced), cincang kasar (chopped), serta makanan yang bisa digenggam (finger food lembut).',
    frequency: '3 - 4 kali makanan utama + 1 - 2 kali makanan selingan.',
    portion: '1/2 hingga 3/4 mangkuk ukuran 250 ml (125 - 200 ml) setiap kali makan.',
    keyRule: 'Jangan terlambat menaikkan tekstur pada usia 9 bulan untuk melatih otot oromotor dan kemampuan bicara anak.',
    recommendedFoods: [
      'Daging sapi giling / cincang empuk',
      'Ikan kakap / kembung / dori kukus suwir',
      'Tahu & tempe lumat',
      'Brokoli rebus lembut & wortel potong stik (finger food)',
      'Potongan buah pepaya atau mangga matang lembut'
    ],
    sampleMenu: [
      { mealTime: 'Pagi (07:00)', dish: 'Nasi Lembek Daging Sapi Cincang', composition: 'Nasi tim lembut + Daging sapi cincang saus tomat segar + Brokoli' },
      { mealTime: 'Selingan (10:00)', dish: 'Stick Wortel & Keju Lembut (Finger Food)', composition: 'Wortel kukus empuk dipotong seukuran jari anak' },
      { mealTime: 'Siang (12:30)', dish: 'Bubur Kasar Ayam Kampung & Jagung Manis', composition: 'Beras jagung + Suwir ayam empuk + Bayam cincang' },
      { mealTime: 'Selingan (15:30)', dish: 'Puding Santan Buah Naga', composition: 'Santan + Agar-agar polos + Buah naga potong' },
      { mealTime: 'Sore (18:00)', dish: 'Nasi Tim Ikan Salmon Kuah Jahe Lembut', composition: 'Beras + Salmon potong dadu kecil + Zucchini + Minyak wijen sedikit' }
    ]
  },
  {
    stage: 'Tahap 3: Menuju Menu Keluarga Mandiri',
    ageRange: '12 - 23 Bulan (1-2 Tahun)',
    texture: 'Makanan keluarga yang diiris atau dipotong sesuai kemampuan kunyah anak (Family Food).',
    frequency: '3 - 4 kali makanan utama + 1 - 2 kali makanan selingan sehat.',
    portion: '3/4 hingga 1 mangkuk penuh ukuran 250 ml.',
    keyRule: 'Beri kesempatan anak makan sendiri dengan sendok dan tangan untuk melatih kemandirian dan motorik halus. Batasi gula garam berlebih.',
    recommendedFoods: [
      'Semua menu sehat keluarga tanpa cabai dan MSG berlebih',
      'Telur dadar gulung bayam keju',
      'Sop daging sapi wortel kentang',
      'Ikan goreng atau bakar kecap',
      'Susu UHT / pasteurisasi sebagai pelengkap setelah usia 1 tahun'
    ],
    sampleMenu: [
      { mealTime: 'Pagi (07:00)', dish: 'Nasi Putih + Telur Dadar Sayur & Kaldu Ayam', composition: 'Nasi biasa empuk + Telur dadar bayam + Kuah sop ayam hangat' },
      { mealTime: 'Selingan (10:00)', dish: 'Potongan Pepaya Manis & Biskuit Gandum', composition: 'Buah potong segar kaya serat' },
      { mealTime: 'Siang (12:30)', dish: 'Nasi Sop Daging Sapi & Perkedel Tahu', composition: 'Nasi + Daging sapi empuk + Wortel + Kentang sop' },
      { mealTime: 'Selingan (15:30)', dish: 'Pancake Pisang Oatmeal Sehat', composition: 'Oatmeal blender + Pisang ranum + Telur panggang tanpa gula pasir' },
      { mealTime: 'Sore (18:00)', dish: 'Nasi Ikan Kembung Goreng & Sayur Bening Bayam', composition: 'Nasi hangat + Ikan kembung duri dibersihkan + Sayur jagung manis bayam' }
    ]
  }
];

export const STUNTING_PREVENTION_TIPS = [
  {
    title: 'Prioritas Utama: Protein Hewani di Setiap Makan',
    desc: 'Penelitian IDAI membuktikan bahwa asam amino esensial dari hewani (telur, ayam, ikan, daging, susu) jauh lebih efektif memacu hormon pertumbuhan (IGF-1) dibanding nabati.'
  },
  {
    title: 'Pantau Berat Badan Setiap Bulan (KMS)',
    desc: 'Jika berat badan tidak naik 2 bulan berturut-turut (Weight Faltering / T2), segera konsultasikan ke dokter anak sebelum anak jatuh ke kondisi stunting.'
  },
  {
    title: 'Cegah Penyakit Infeksi Berulang',
    desc: 'Lengkapi seluruh imunisasi dasar dan jaga sanitasi air serta cuci tangan pakai sabun, karena diare atau batuk berulang menghabiskan kalori tumbuh anak.'
  },
  {
    title: 'Tekstur Tepat Sesuai Usia',
    desc: 'Jangan terlambat naik tekstur agar anak tidak mengalami GTM (Gerakan Tutup Mulut) akibat malas mengunyah saat memasuki usia 1 tahun.'
  }
];
