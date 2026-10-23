import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Support large JSON payloads for offline sync
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 1. Setup Persistent Storage Folders
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, 'database.json');

// Initialize database helper
function getDatabase() {
  try {
    if (fs.existsSync(dbFilePath)) {
      const content = fs.readFileSync(dbFilePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }
  return {
    child: null,
    growthRecords: [],
    vaccineLogs: [],
    memories: [],
  };
}

function saveDatabase(data: any) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// 2. Setup Multer for Real-Time File Uploads (Images & Videos up to 100MB)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${cleanName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for high-res videos/photos
});

/**
 * Real-Time File Upload API: POST /api/upload
 */
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Tidak ada berkas yang diunggah' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    return res.json({
      success: true,
      url: fileUrl,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
      mediaType,
    });
  } catch (err: any) {
    console.error('Error in file upload:', err);
    return res.status(500).json({ error: 'Gagal mengunggah berkas', details: err.message });
  }
});

/**
 * Real-Time Online Database APIs
 */
app.get('/api/database', (_req: Request, res: Response) => {
  const db = getDatabase();
  return res.json(db);
});

app.post('/api/memories', (req: Request, res: Response) => {
  try {
    const memory = req.body;
    if (!memory || !memory.id) {
      return res.status(400).json({ error: 'Data memori tidak lengkap' });
    }

    const db = getDatabase();
    const existingIndex = db.memories.findIndex((m: any) => m.id === memory.id);
    if (existingIndex >= 0) {
      db.memories[existingIndex] = memory;
    } else {
      db.memories.unshift(memory);
    }

    saveDatabase(db);
    return res.json({ success: true, memory });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menyimpan memori', details: err.message });
  }
});

app.delete('/api/memories/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const memToDelete = db.memories.find((m: any) => m.id === id);

    // If file is stored in local uploads, delete it
    if (memToDelete?.mediaUrl?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), memToDelete.mediaUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not delete file from disk:', e);
        }
      }
    }

    db.memories = db.memories.filter((m: any) => m.id !== id);
    saveDatabase(db);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menghapus memori', details: err.message });
  }
});

app.post('/api/child', (req: Request, res: Response) => {
  try {
    const child = req.body;
    const db = getDatabase();
    db.child = child;
    saveDatabase(db);
    return res.json({ success: true, child });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal memperbarui profil anak', details: err.message });
  }
});

app.post('/api/growth', (req: Request, res: Response) => {
  try {
    const record = req.body;
    const db = getDatabase();
    const existingIndex = db.growthRecords.findIndex((r: any) => r.id === record.id);
    if (existingIndex >= 0) {
      db.growthRecords[existingIndex] = record;
    } else {
      db.growthRecords.push(record);
    }
    saveDatabase(db);
    return res.json({ success: true, record });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menyimpan data antropometri', details: err.message });
  }
});

app.delete('/api/growth/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    db.growthRecords = (db.growthRecords || []).filter((r: any) => r.id !== id);
    saveDatabase(db);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Gagal menghapus data antropometri', details: err.message });
  }
});


// Initialize GoogleGenAI SDK (Server-Side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * 1. AI Growth Analysis Endpoint (Evaluasi Tumbuh Kembang & Risiko Stunting)
 */
app.post('/api/ai/growth-analysis', async (req: Request, res: Response) => {
  try {
    const { child, latestRecord, previousRecords } = req.body;

    if (!child || !latestRecord) {
      return res.status(400).json({ error: 'Data anak dan data pengukuran wajib diisi' });
    }

    const prompt = `Anda adalah seorang Dokter Spesialis Anak (Sp.A) konsultan tumbuh kembang anak di Indonesia.
Berikan analisis medis yang jelas, menenangkan, solutif, dan mudah dipahami orang tua berdasarkan data pengukuran berikut:

DATA ANAK:
- Nama: ${child.name}
- Jenis Kelamin: ${child.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
- Tanggal Lahir: ${child.birthDate}
- Berat Lahir: ${child.birthWeight} kg | Panjang Lahir: ${child.birthHeight} cm

PENGUKURAN TERAKHIR:
- Tanggal: ${latestRecord.date}
- Usia: ${latestRecord.ageMonths} Bulan
- Berat Badan: ${latestRecord.weight} kg (Status BB/U: ${latestRecord.status?.weightForAge || 'Normal'})
- Tinggi/Panjang Badan: ${latestRecord.height} cm (Status TB/U: ${latestRecord.status?.heightForAge || 'Normal'})
- Lingkar Kepala: ${latestRecord.headCircumference ? latestRecord.headCircumference + ' cm' : 'Tidak diukur'}
- Status Gizi BB/TB: ${latestRecord.status?.weightForHeight || 'Gizi Baik'}

RIWAYAT SEBELUMNYA:
${JSON.stringify(previousRecords || [], null, 2)}

Format jawaban terstruktur dengan bagian:
1. Ringkasan Status Pertumbuhan Saat Ini (Evaluasi BB, TB, dan status gizi sesuai kurva WHO/KMS)
2. Tren Kenaikan Berat Badan & Evaluasi Risiko Stunting (Apakah kurva naik memadai atau ada tanda weight faltering?)
3. Rekomendasi Nutrisi Praktis (Saran protein hewani, kalori, lemak tambahan khas bahan makanan lokal Indonesia)
4. Rekomendasi Stimulasi Perkembangan (Saran aktivitas motorik, bicara, dan sosial sesuai usianya)
5. Kapan Harus Segera ke Faskes / Dokter Spesialis Anak (Tanda bahaya / Red flags)

Gunakan bahasa Indonesia yang empatik, profesional, hangat untuk orang tua. Hindari jargon medis rumit tanpa penjelasan.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah Dokter Spesialis Anak (Sp.A) konsultan tumbuh kembang anak Indonesia yang ramah, berbasis bukti ilmiah (IDAI & WHO), empatik, dan mengutamakan pencegahan stunting.',
        temperature: 0.7,
      },
    });

    const analysis = response.text || 'Tidak dapat menghasilkan analisis.';
    return res.json({ analysis });
  } catch (error: any) {
    console.error('Error generating growth analysis:', error);
    return res.status(500).json({
      error: 'Gagal melakukan analisis AI. Pastikan konfigurasi API key valid.',
      details: error.message,
    });
  }
});

/**
 * 2. Pediatrician AI Consultation Endpoint (Konsultasi Dokter Anak AI)
 */
app.post('/api/ai/consult', async (req: Request, res: Response) => {
  try {
    const { message, history, childContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Pesan pertanyaan wajib diisi' });
    }

    const contextInstruction = childContext
      ? `Konteks Pasien Anak: Nama ${childContext.name}, jenis kelamin ${childContext.gender === 'male' ? 'Laki-laki' : 'Perempuan'}, usia saat ini sekitar ${childContext.ageDisplay || 'balita'}, berat terkini ${childContext.weight || '-'} kg.`
      : 'Konteks Pasien Anak: Anak balita Indonesia.';

    const systemPrompt = `Anda adalah Dr. Sari Rahmawati, Sp.A, dokter spesialis anak ramah, penuh perhatian, dan berpengalaman di Indonesia.
${contextInstruction}

Prinsip Pelayanan:
- Berikan penjelasan yang menenangkan, ilmiah (berdasarkan panduan IDAI dan WHO), dan praktis untuk dipraktikkan di rumah.
- Jika ada keluhan demam, batuk, pilek, diare, GTM (Gerakan Tutup Mulut), imunisasi, atau keterlambatan bicara/motorik, beri panduan pertolongan pertama yang aman.
- Selalu cantumkan 'Tanda Bahaya (Red Flags)' yang mengharuskan orang tua segera membawa anak ke IGD/Rumah Sakit (misal: kejang, demam >39°C pada bayi muda, napas cepat/sesak, dehidrasi, tidur terus sulit dibangunkan).
- Berikan bahasa Indonesia yang santun, hangat, dan suportif.`;

    // Build chat message format or single turn prompt with context
    let formattedPrompt = `Pertanyaan Orang Tua: "${message}"`;
    if (history && history.length > 0) {
      const recentHistory = history.slice(-4).map((h: any) => `${h.sender === 'user' ? 'Orang Tua' : 'Dr. Sari'}: ${h.text}`).join('\n');
      formattedPrompt = `Riwayat percakapan sebelumnya:\n${recentHistory}\n\nPertanyaan Orang Tua terkini: "${message}"`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: formattedPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Maaf, Dokter sedang tidak dapat merespons saat ini.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error during pediatrician consult:', error);
    return res.status(500).json({
      error: 'Terjadi kendala saat konsultasi dokter AI.',
      details: error.message,
    });
  }
});

/**
 * 3. AI MPASI Planner (Rencana Menu Padat Gizi Khas Indonesia)
 */
app.post('/api/ai/mpasi-planner', async (req: Request, res: Response) => {
  try {
    const { ageMonths, preferences, allergies } = req.body;

    const prompt = `Buatkan jadwal menu MPASI harian padat gizi (3x makan utama + 2x selingan) untuk anak usia ${ageMonths || 9} bulan di Indonesia.
Alergi / pantangan: ${allergies || 'Tidak ada'}.
Catatan khusus / bahan yang disukai: ${preferences || 'Bahan lokal pasar tradisional (telur, hati ayam, ikan, tempe, santan)'}.

Pastikan:
- Komposisi 4 Bintang lengkap dengan penekanan utama PROTEIN HEWANI untuk cegah stunting.
- Tekstur disesuaikan dengan usia anak (${ageMonths} bulan).
- Cantumkan porsi takaran dan langkah memasak singkat yang higienis dan praktis.
- Tulis dalam format ringkas yang rapi dan menarik.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Anda adalah Ahli Gizi Anak dan Dokter Spesialis Anak spesialis nutrisi MPASI di Indonesia.',
        temperature: 0.7,
      },
    });

    return res.json({ plan: response.text });
  } catch (error: any) {
    console.error('Error in MPASI planner:', error);
    return res.status(500).json({
      error: 'Gagal membuat rencana menu MPASI.',
      details: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server TumbuhKembang running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
