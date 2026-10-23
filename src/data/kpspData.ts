import { KPSPAgeGroup } from '../types';

export const KPSP_AGE_GROUPS: KPSPAgeGroup[] = [
  {
    ageMonths: 3,
    title: 'KPSP Usia 3 Bulan',
    questions: [
      {
        id: 'kpsp_3_1',
        aspect: 'motorik_kasar',
        question: 'Pada posisi telungkup, apakah anak dapat mengangkat kepala dengan sudut 45 derajat?',
        instruction: 'Letakkan bayi pada posisi tengkurap di atas permukaan datar.'
      },
      {
        id: 'kpsp_3_2',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak bereaksi terkejut, berkedip, atau menoleh bila mendengar suara keras mendadak?',
        instruction: 'Tepuk tangan di dekat kepala bayi saat dia tenang.'
      },
      {
        id: 'kpsp_3_3',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak tersenyum kembali ketika Anda mengajak bicara atau tersenyum kepadanya?',
        instruction: 'Tatap wajah bayi dan tersenyumlah dengan hangat.'
      },
      {
        id: 'kpsp_3_4',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat menggerakkan kedua tangan dan kakinya secara bersamaan dan seimbang?',
        instruction: 'Perhatikan saat bayi berbaring terlentang.'
      },
      {
        id: 'kpsp_3_5',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak mengeluarkan suara selain menangis (seperti "ooh", "aah", atau cooing)?',
        instruction: 'Dengarkan saat bayi diajak bercanda atau bicara.'
      },
      {
        id: 'kpsp_3_6',
        aspect: 'motorik_halus',
        question: 'Apakah mata anak mengikuti benda bergerak dari samping ke tengah (90 derajat)?',
        instruction: 'Gerakkan mainan berwarna cerah di depan mata bayi.'
      }
    ]
  },
  {
    ageMonths: 6,
    title: 'KPSP Usia 6 Bulan',
    questions: [
      {
        id: 'kpsp_6_1',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat membalikkan badannya sendiri dari posisi telentang ke tengkurap atau sebaliknya?',
        instruction: 'Amati saat bayi bermain di atas matras.'
      },
      {
        id: 'kpsp_6_2',
        aspect: 'motorik_halus',
        question: 'Apakah anak berusaha menggapai dan meraih mainan atau benda yang didekatkan ke tangannya?',
        instruction: 'Dekatkan mainan menarik ke hadapannya.'
      },
      {
        id: 'kpsp_6_3',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak menolehkan kepala ke arah sumber suara (misal bel berbunyi atau dipanggil namanya)?',
        instruction: 'Panggil namanya lembut dari samping tanpa melihat matanya terlebih dahulu.'
      },
      {
        id: 'kpsp_6_4',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak tersenyum melihat bayangannya sendiri di cermin?',
        instruction: 'Bawa bayi di depan cermin.'
      },
      {
        id: 'kpsp_6_5',
        aspect: 'motorik_kasar',
        question: 'Pada posisi telungkup, apakah anak dapat menopang berat badannya dengan kedua tangan lurus?',
        instruction: 'Amati kekuatan lengan bayi mengangkat dada.'
      },
      {
        id: 'kpsp_6_6',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak mulai mengeluarkan suara ocehan berulang seperti "ba-ba", "da-da", atau "ma-ma"?',
        instruction: 'Dengarkan vokalisasi babbling anak.'
      }
    ]
  },
  {
    ageMonths: 9,
    title: 'KPSP Usia 9 Bulan',
    questions: [
      {
        id: 'kpsp_9_1',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat duduk sendiri tanpa bantuan/sandaran selama minimal 60 detik?',
        instruction: 'Dudukkan anak di lantai datar tanpa bantal.'
      },
      {
        id: 'kpsp_9_2',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat memindahkan mainan atau benda dari satu tangan ke tangan yang lain?',
        instruction: 'Berikan balok kayu kecil ke salah satu tangannya.'
      },
      {
        id: 'kpsp_9_3',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak bermain "Cilukba" (Peek-a-boo) dengan riang atau berusaha mencari wajah yang sembunyi?',
        instruction: 'Tutup wajah Anda dengan kain tipis lalu buka sambil berkata cilukba.'
      },
      {
        id: 'kpsp_9_4',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat memungut benda kecil (seperti remah biskuit) menggunakan ibu jari dan jari telunjuk (pincer grasp)?',
        instruction: 'Letakkan kismis/remah roti di piring datar di depan anak.'
      },
      {
        id: 'kpsp_9_5',
        aspect: 'motorik_kasar',
        question: 'Apakah anak berusaha merangkak atau mengesot untuk berpindah tempat meraih mainan?',
        instruction: 'Letakkan mainan berjarak 1 meter di depan anak.'
      },
      {
        id: 'kpsp_9_6',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak melambaikan tangan "da-da" saat diajak berpamitan?',
        instruction: 'Lambaikan tangan dan katakan "da-da" kepada anak.'
      }
    ]
  },
  {
    ageMonths: 12,
    title: 'KPSP Usia 12 Bulan (1 Tahun)',
    questions: [
      {
        id: 'kpsp_12_1',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat berdiri sendiri berpegangan pada perabot atau tangan Anda selama 30 detik?',
        instruction: 'Bantu anak berdiri di dekat sofa atau pegangi tangannya.'
      },
      {
        id: 'kpsp_12_2',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak dapat mengucapkan minimal satu kata bermakna (misal: "Mama", "Papa", "Air", "Bola")?',
        instruction: 'Kata harus spesifik ditujukan pada subjek/objek yang tepat.'
      },
      {
        id: 'kpsp_12_3',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak dapat mengulurkan tangan atau kakinya saat dipakaikan baju?',
        instruction: 'Perhatikan respon anak saat Anda mengenakan pakaian.'
      },
      {
        id: 'kpsp_12_4',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat memasukkan balok atau mainan kecil ke dalam wadah atau mangkuk?',
        instruction: 'Beri wadah dan beberapa balok kecil.'
      },
      {
        id: 'kpsp_12_5',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak minum dari cangkir/gelas yang dipegangi oleh orang tua tanpa tumpah banyak?',
        instruction: 'Beri minum menggunakan cangkir anak.'
      },
      {
        id: 'kpsp_12_6',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat melangkah beberapa langkah sambil dituntun atau merambat (cruising)?',
        instruction: 'Tuntun kedua tangannya untuk melangkah maju.'
      }
    ]
  },
  {
    ageMonths: 18,
    title: 'KPSP Usia 18 Bulan',
    questions: [
      {
        id: 'kpsp_18_1',
        aspect: 'motorik_kasar',
        question: 'Apakah anak sudah dapat berjalan sendiri secara mandiri tanpa berpegangan?',
        instruction: 'Amati anak berjalan di dalam ruangan.'
      },
      {
        id: 'kpsp_18_2',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak dapat menunjuk anggota tubuhnya (misal: hidung, mata, perut) saat Anda bertanya "Mana hidung?"?',
        instruction: 'Tanyakan nama 2-3 anggota tubuh tanpa mengisyaratkan tangan Anda.'
      },
      {
        id: 'kpsp_18_3',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat menyusun menara minimal 2-3 buah balok kayu ke atas tanpa roboh?',
        instruction: 'Sediakan balok kayu mainan ukuran 2.5cm.'
      },
      {
        id: 'kpsp_18_4',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak dapat menyuap makanan ke mulutnya sendiri menggunakan sendok?',
        instruction: 'Perhatikan saat jam makan anak.'
      },
      {
        id: 'kpsp_18_5',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak memiliki perbendaharaan kata minimal 6-10 kata selain mama dan papa?',
        instruction: 'Catat kata-kata yang sering diucapkan anak.'
      },
      {
        id: 'kpsp_18_6',
        aspect: 'motorik_halus',
        question: 'Apakah anak suka mencoret-coret kertas dengan krayon atau pensil warna?',
        instruction: 'Beri selembar kertas dan krayon tebal.'
      }
    ]
  },
  {
    ageMonths: 24,
    title: 'KPSP Usia 24 Bulan (2 Tahun)',
    questions: [
      {
        id: 'kpsp_24_1',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak dapat merangkai kalimat 2 kata (misal: "Mau minum", "Mama bobo", "Mobil jalan")?',
        instruction: 'Bukan sekadar mengulang perkataan orang tua (echolalia).'
      },
      {
        id: 'kpsp_24_2',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat menendang bola ke depan tanpa terjatuh atau kehilangan keseimbangan?',
        instruction: 'Letakkan bola sepak kecil di depan anak.'
      },
      {
        id: 'kpsp_24_3',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat menumpuk menara 4 sampai 6 balok kayu tanpa jatuh?',
        instruction: 'Amati ketelitian dan koordinasi tangan anak.'
      },
      {
        id: 'kpsp_24_4',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak dapat melepas pakaian sederhana sendiri (seperti celana karet atau kaos kaki)?',
        instruction: 'Tanyakan kebiasaan mandiri anak sehari-hari.'
      },
      {
        id: 'kpsp_24_5',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat menaiki tangga dengan kedua kaki melangkah bergantian atau bertahap?',
        instruction: 'Perhatikan anak saat menaiki undakan tangga rumah.'
      },
      {
        id: 'kpsp_24_6',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak mengerti dan mengikuti perintah sederhana 2 langkah (misal: "Ambil bolamu lalu berikan ke Ayah")?',
        instruction: 'Ucapkan perintah perlahan dan jelas.'
      }
    ]
  },
  {
    ageMonths: 36,
    title: 'KPSP Usia 36 Bulan (3 Tahun)',
    questions: [
      {
        id: 'kpsp_36_1',
        aspect: 'motorik_kasar',
        question: 'Apakah anak dapat berdiri dengan satu kaki selama minimal 2-3 detik?',
        instruction: 'Peragakan contoh berdiri dengan satu kaki seperti bangau.'
      },
      {
        id: 'kpsp_36_2',
        aspect: 'motorik_halus',
        question: 'Apakah anak dapat meniru membuat garis lurus vertikal atau horizontal di atas kertas?',
        instruction: 'Gambar garis di kertas, lalu minta anak menirunya.'
      },
      {
        id: 'kpsp_36_3',
        aspect: 'bicara_bahasa',
        question: 'Apakah orang lain yang bukan anggota keluarga dapat memahami sebagian besar perkataan anak?',
        instruction: 'Kejelasan artikulasi dan tata kalimat anak.'
      },
      {
        id: 'kpsp_36_4',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak bermain bersama anak lain secara interaktif (bukan hanya bermain sendiri di samping temannya)?',
        instruction: 'Amati saat berkumpul bersama teman sebaya.'
      },
      {
        id: 'kpsp_36_5',
        aspect: 'bicara_bahasa',
        question: 'Apakah anak dapat menyebutkan nama, umur, dan jenis kelaminnya saat ditanya?',
        instruction: 'Tanya: "Siapa namamu? Kamu laki-laki atau perempuan?"'
      },
      {
        id: 'kpsp_36_6',
        aspect: 'sosialisasi_kemandirian',
        question: 'Apakah anak dapat memakai celana sendiri setelah selesai buang air kecil (toilet training)?',
        instruction: 'Tanyakan kemandirian toilet training anak.'
      }
    ]
  }
];

export function getRecommendedKPSPAge(ageMonths: number): KPSPAgeGroup {
  // Find the closest screening age group <= ageMonths, default to 3
  const valid = KPSP_AGE_GROUPS.filter(g => g.ageMonths <= ageMonths);
  if (valid.length === 0) return KPSP_AGE_GROUPS[0];
  return valid[valid.length - 1];
}
