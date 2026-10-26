import React, { useState, useRef, useEffect } from 'react';
import { ChildProfile, ChildMemory } from '../types';
import { Camera, Image as ImageIcon, Video, Download, Sparkles, Filter, Plus, Heart, Share2, Play, Loader2, CheckCircle2, ExternalLink, Cloud } from 'lucide-react';
import { ClothespinClip } from './ClothespinClip';
import { downloadMediaFile } from '../utils/imageCompressor';

interface KolaseViewProps {
  child: ChildProfile;
  memories: ChildMemory[];
  onOpenUploadModal: () => void;
  onDeleteMemory: (id: string) => void;
}

export const KolaseView: React.FC<KolaseViewProps> = ({
  child,
  memories,
  onOpenUploadModal,
  onDeleteMemory,
}) => {
  const [viewMode, setViewMode] = useState<'polaroid' | 'studio' | 'timeline'>('polaroid');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMemory, setSelectedMemory] = useState<ChildMemory | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccessId, setDownloadSuccessId] = useState<string | null>(null);

  const handleDownloadMedia = async (mem: ChildMemory, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      setDownloadingId(mem.id);
      const ext = mem.mediaType === 'video' ? 'mp4' : 'jpg';
      const cleanTitle = (mem.title || 'Momen').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${child.name}_${cleanTitle}_${mem.date}.${ext}`;
      await downloadMediaFile(mem.mediaUrl, filename, mem.driveFileId);
      setDownloadSuccessId(mem.id);
      setTimeout(() => setDownloadSuccessId(null), 2500);
    } catch (err) {
      console.warn('Gagal mengunduh media:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Studio Collage state
  const [selectedForCollage, setSelectedForCollage] = useState<string[]>([]);
  const [collageLayout, setCollageLayout] = useState<'duo' | 'trio' | 'quad'>('trio');
  const [collageTheme, setCollageTheme] = useState<'cream' | 'mint' | 'pink' | 'white'>('cream');
  const [collageTitle, setCollageTitle] = useState(`Kenangan Tumbuh Kembang ${child.name}`);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize selected photos for collage if empty
  useEffect(() => {
    if (selectedForCollage.length === 0 && memories.length > 0) {
      setSelectedForCollage(memories.slice(0, 3).map((m) => m.id));
    }
  }, [memories]);

  // Filter memories
  const filteredMemories = memories.filter((m) => {
    if (mediaFilter === 'image') return m.mediaType === 'image';
    if (mediaFilter === 'video') return m.mediaType === 'video';
    return true;
  });

  // Toggle selection for collage studio
  const toggleSelectForCollage = (id: string) => {
    if (selectedForCollage.includes(id)) {
      setSelectedForCollage(selectedForCollage.filter((item) => item !== id));
    } else {
      if (selectedForCollage.length < 4) {
        setSelectedForCollage([...selectedForCollage, id]);
      }
    }
  };

  // Render HTML5 Canvas for the Collage Studio
  useEffect(() => {
    if (viewMode !== 'studio' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1000;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Background Theme
    const themes = {
      cream: '#FAF6F0',
      mint: '#F0F7F4',
      pink: '#FDF2F4',
      white: '#FFFFFF',
    };
    ctx.fillStyle = themes[collageTheme];
    ctx.fillRect(0, 0, width, height);

    // Decorative inner frame
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 12;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header title on canvas
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 32px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(collageTitle, width / 2, 75);

    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText(`Jurnal Ayah & Buah Hati · ${child.name}`, width / 2, 105);

    // Load selected memory images onto canvas
    const activeMemories = memories.filter((m) => selectedForCollage.includes(m.id));

    const drawPolaroid = (
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number,
      title: string,
      weight?: number
    ) => {
      // White polaroid container
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 8;
      ctx.fillRect(x, y, w, h);
      ctx.shadowColor = 'transparent';

      // Inner image
      const pad = 14;
      const imgH = h - 55;
      ctx.drawImage(img, x + pad, y + pad, w - pad * 2, imgH - pad);

      // Weight badge
      if (weight) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(x + w - pad - 75, y + pad + 8, 70, 26, 13);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${weight} kg`, x + w - pad - 40, y + pad + 25);
      }

      // Title caption
      ctx.fillStyle = '#1E293B';
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(title, x + pad, y + h - 18, w - pad * 2);
    };

    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    activeMemories.slice(0, 4).forEach((mem, index) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = mem.mediaUrl;
      img.onload = () => {
        loadedCount++;
        loadedImages[index] = img;
        if (loadedCount === Math.min(activeMemories.length, 4)) {
          // All images loaded, draw layout
          if (loadedImages.length === 1) {
            drawPolaroid(loadedImages[0], 200, 150, 600, 720, activeMemories[0].title, activeMemories[0].weightAtMoment);
          } else if (loadedImages.length === 2) {
            drawPolaroid(loadedImages[0], 60, 160, 420, 680, activeMemories[0].title, activeMemories[0].weightAtMoment);
            drawPolaroid(loadedImages[1], 520, 160, 420, 680, activeMemories[1].title, activeMemories[1].weightAtMoment);
          } else if (loadedImages.length === 3) {
            drawPolaroid(loadedImages[0], 60, 160, 420, 700, activeMemories[0].title, activeMemories[0].weightAtMoment);
            drawPolaroid(loadedImages[1], 520, 160, 420, 335, activeMemories[1].title, activeMemories[1].weightAtMoment);
            drawPolaroid(loadedImages[2], 520, 525, 420, 335, activeMemories[2].title, activeMemories[2].weightAtMoment);
          } else {
            // 4 images (2x2)
            drawPolaroid(loadedImages[0], 60, 160, 420, 360, activeMemories[0].title, activeMemories[0].weightAtMoment);
            drawPolaroid(loadedImages[1], 520, 160, 420, 360, activeMemories[1].title, activeMemories[1].weightAtMoment);
            drawPolaroid(loadedImages[2], 60, 545, 420, 360, activeMemories[2].title, activeMemories[2].weightAtMoment);
            drawPolaroid(loadedImages[3], 520, 545, 420, 360, activeMemories[3].title, activeMemories[3].weightAtMoment);
          }

          // Footer watermark
          ctx.font = '13px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#94A3B8';
          ctx.textAlign = 'center';
          ctx.fillText('Dibuat dengan Kasih Sayang di TumbuhKembang', width / 2, height - 30);
        }
      };
    });
  }, [viewMode, selectedForCollage, collageTheme, collageTitle, memories, child]);

  const handleDownloadCollage = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kolase_${child.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Kolase Header */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full">
              Galeri & Kolase Polaroid
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{memories.length} Momen Tersimpan</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Kenangan Tumbuh Kembang {child.name}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Abadikan setiap langkah, tawa, dan kenaikan berat badan si kecil dalam bentuk jurnal kolase estetik.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all active:scale-98 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>+ Upload Foto/Video</span>
        </button>
      </div>

      {/* View Mode & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF8F5] p-2 rounded-2xl border border-stone-200">
        {/* View Tabs */}
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('polaroid')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'polaroid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dinding Polaroid
          </button>
          <button
            onClick={() => setViewMode('studio')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'studio'
                ? 'bg-white text-teal-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Studio Kolase Foto ✨
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              viewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Linimasa Milestone
          </button>
        </div>

        {/* Media filter */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={() => setMediaFilter('all')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
              mediaFilter === 'all' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setMediaFilter('image')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
              mediaFilter === 'image' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Foto
          </button>
          <button
            onClick={() => setMediaFilter('video')}
            className={`px-3 py-1 text-xs rounded-lg transition-colors cursor-pointer ${
              mediaFilter === 'video' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Video
          </button>
        </div>
      </div>

      {/* VIEW 1: Dinding Polaroid */}
      {viewMode === 'polaroid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredMemories.map((mem, idx) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="bg-white rounded-2xl border border-stone-200 p-3 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between relative mt-3"
            >
              {/* Aesthetic Clothespin Clip pinned at the top rim */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <ClothespinClip color={idx % 2 === 0 ? 'wood' : 'teal'} rotation={idx % 2 === 0 ? -2 : 3} size="sm" />
              </div>

              {/* Photo Frame */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                {mem.mediaType === 'video' ? (
                  <video
                    src={mem.mediaUrl}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <img
                    src={mem.mediaUrl}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Weight badge overlay */}
                {mem.weightAtMoment && (
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {mem.weightAtMoment} kg
                  </div>
                )}

                {mem.mediaType === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-teal-700 flex items-center justify-center shadow-md">
                      <Play className="w-5 h-5 ml-0.5" />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer / Caption */}
              <div className="pt-3 px-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>{mem.date}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-teal-800">{mem.ageDisplay}</span>
                    <button
                      onClick={(e) => handleDownloadMedia(mem, e)}
                      title="Unduh foto/video ini ke perangkat"
                      className="p-1 rounded-md text-stone-400 hover:text-teal-700 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      {downloadingId === mem.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                      ) : downloadSuccessId === mem.id ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors">
                  {mem.title}
                </h4>
                {mem.caption && (
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {mem.caption}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Add Tile */}
          <button
            onClick={onOpenUploadModal}
            className="border-2 border-dashed border-stone-300 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white/60 hover:bg-teal-50/40 transition-colors cursor-pointer aspect-square min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-2.5">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-bold text-slate-800">+ Tambah Foto/Video</span>
            <span className="text-xs text-slate-400 mt-1">Abadikan momen si kecil</span>
          </button>
        </div>
      )}

      {/* VIEW 2: Studio Kolase Foto (Interactive Canvas Generator) */}
      {viewMode === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Settings Column */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pengaturan Kolase</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih foto (1-4 foto) dan atur tema untuk diexport jadi poster kenangan.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Judul Kolase</label>
              <input
                type="text"
                value={collageTitle}
                onChange={(e) => setCollageTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Warna Latar Scrapbook</label>
              <div className="flex items-center gap-2">
                {[
                  { key: 'cream', label: 'Warm Cream', color: '#FAF6F0' },
                  { key: 'mint', label: 'Pastel Mint', color: '#F0F7F4' },
                  { key: 'pink', label: 'Soft Pink', color: '#FDF2F4' },
                  { key: 'white', label: 'Pure White', color: '#FFFFFF' },
                ].map((th) => (
                  <button
                    key={th.key}
                    type="button"
                    onClick={() => setCollageTheme(th.key as any)}
                    className={`w-9 h-9 rounded-xl border-2 transition-transform cursor-pointer ${
                      collageTheme === th.key ? 'border-teal-600 scale-110 shadow-xs' : 'border-stone-200'
                    }`}
                    style={{ backgroundColor: th.color }}
                    title={th.label}
                  />
                ))}
              </div>
            </div>

            {/* Select Photos from Memories */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Foto dari Galeri ({selectedForCollage.length}/4 terpilih)
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                {memories
                  .filter((m) => m.mediaType === 'image')
                  .map((mem) => {
                    const isSelected = selectedForCollage.includes(mem.id);
                    return (
                      <div
                        key={mem.id}
                        onClick={() => toggleSelectForCollage(mem.id)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-teal-600 ring-2 ring-teal-400' : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={mem.mediaUrl} alt={mem.title} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <button
              onClick={handleDownloadCollage}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Simpan / Unduh Kolase (PNG)</span>
            </button>
          </div>

          {/* Canvas Preview Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <span className="text-xs font-bold text-slate-700">Preview Kolase Resolusi Tinggi</span>
              <span className="text-[11px] text-slate-400">1000 × 1000 piksel</span>
            </div>
            <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-100 flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Linimasa Milestone */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Linimasa Perjalanan Tumbuh Kembang {child.name}
          </h3>

          <div className="relative border-l-2 border-teal-200 ml-4 pl-6 space-y-8">
            {filteredMemories.map((mem) => (
              <div key={mem.id} className="relative group">
                {/* Dot node */}
                <div className="absolute -left-9.5 top-1.5 w-6 h-6 rounded-full bg-teal-600 border-4 border-white shadow-xs flex items-center justify-center text-white text-[10px]" />

                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-teal-800 bg-teal-100/70 px-2.5 py-0.5 rounded-full self-start">
                      {mem.ageDisplay}
                    </span>
                    <span className="text-xs text-slate-400">{mem.date}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-4 aspect-4/3 rounded-xl overflow-hidden bg-stone-200">
                      {mem.mediaType === 'video' ? (
                        <video src={mem.mediaUrl} className="w-full h-full object-cover" controls />
                      ) : (
                        <img src={mem.mediaUrl} alt={mem.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="sm:col-span-8">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{mem.title}</h4>
                        {mem.weightAtMoment && (
                          <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                            {mem.weightAtMoment} kg
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {mem.caption || 'Momen manis bersama buah hati.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Memory Preview Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="relative aspect-4/3 bg-black flex items-center justify-center">
              {selectedMemory.mediaType === 'video' ? (
                <video src={selectedMemory.mediaUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img src={selectedMemory.mediaUrl} alt={selectedMemory.title} className="w-full h-full object-contain" />
              )}
              {selectedMemory.weightAtMoment && (
                <div className="absolute top-4 right-4 bg-slate-900/90 text-white text-xs font-mono font-bold px-3 py-1 rounded-full shadow-md">
                  {selectedMemory.weightAtMoment} kg
                </div>
              )}
              <button
                onClick={() => setSelectedMemory(null)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedMemory.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedMemory.ageDisplay} · Tanggal {selectedMemory.date}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const ok = window.confirm(`Apakah Anda yakin ingin menghapus kenangan "${selectedMemory.title}"?`);
                    if (ok) {
                      onDeleteMemory(selectedMemory.id);
                      setSelectedMemory(null);
                    }
                  }}
                  className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors text-xs cursor-pointer"
                >
                  Hapus
                </button>
              </div>

              {selectedMemory.caption && (
                <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  {selectedMemory.caption}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadMedia(selectedMemory)}
                    disabled={downloadingId === selectedMemory.id}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs active:scale-95"
                  >
                    {downloadingId === selectedMemory.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunduh...</span>
                      </>
                    ) : downloadSuccessId === selectedMemory.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Tersimpan di HP!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh {selectedMemory.mediaType === 'video' ? 'Video' : 'Foto'}</span>
                      </>
                    )}
                  </button>

                  {(selectedMemory.driveLink || selectedMemory.driveFileId) && (
                    <a
                      href={selectedMemory.driveLink || `https://drive.google.com/file/d/${selectedMemory.driveFileId}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-200 transition-colors"
                      title="Lihat berkas asli di Google Drive"
                    >
                      <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Buka di Drive</span>
                      <ExternalLink className="w-3 h-3 text-amber-700" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMemory(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
