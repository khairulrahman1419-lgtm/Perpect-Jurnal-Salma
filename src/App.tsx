import React, { useState, useEffect } from 'react';
import { ChildProfile, GrowthRecord, VaccineLog, MilestoneTestRecord, ChildMemory } from './types';
import { INITIAL_CHILD, INITIAL_GROWTH_RECORDS, INITIAL_VACCINE_LOGS, INITIAL_MEMORIES } from './data/initialData';
import { HomeDashboardView } from './components/HomeDashboardView';
import { KolaseView } from './components/KolaseView';
import { GrowthTrackerTab } from './components/GrowthTrackerTab';
import { MilestoneKPSPTab } from './components/MilestoneKPSPTab';
import { ImmunizationTab } from './components/ImmunizationTab';
import { MPASITab } from './components/MPASITab';
import { AIConsultTab } from './components/AIConsultTab';
import { UploadMediaModal } from './components/UploadMediaModal';
import { EditProfileModal } from './components/EditProfileModal';
import { KIAReportModal } from './components/KIAReportModal';
import { ThemeSelectorModal, WALLPAPER_THEMES } from './components/ThemeSelectorModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { WeeklyWisdomQuoteBar } from './components/WeeklyWisdomQuoteBar';
import { FloatingDoctorAIWidget } from './components/FloatingDoctorAIWidget';
import { evaluateGrowthStatus, calculateAgeInMonths } from './utils/whoStandards';
import { auth, googleSignIn, googleSignOut } from './services/googleDriveService';
import {
  fetchOnlineDatabase,
  deleteOnlineMemory,
  saveOnlineGrowthRecord,
  deleteOnlineGrowthRecord,
  saveOnlineChild,
} from './services/apiService';
import { testFirestoreConnection } from './services/firebase';
import {
  saveChildToFirestore,
  fetchAllChildrenFromFirestore,
  saveGrowthRecordToFirestore,
  deleteGrowthRecordFromFirestore,
  fetchGrowthRecordsFromFirestore,
  saveVaccineLogToFirestore,
  fetchVaccineLogsFromFirestore,
  saveMemoryToFirestore,
  deleteMemoryFromFirestore,
  fetchMemoriesFromFirestore,
  exportChildDataToJson,
} from './services/firestoreService';
import {
  Home,
  Layers,
  TrendingUp,
  Award,
  Camera,
  MoreVertical,
  Heart,
  ShieldCheck,
  Utensils,
  MessageCircle,
  Plus,
  Scale,
  Printer,
  Cloud,
  Sliders,
  Palette,
  Check,
  UserCheck,
  Download
} from 'lucide-react';

type MainTab = 'beranda' | 'kolase' | 'kurva_who' | 'milestone' | 'imunisasi' | 'mpasi' | 'dokter_ai';

export default function App() {
  // Persistence states
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => {
    const saved = localStorage.getItem('tk_children');
    return saved ? JSON.parse(saved) : [INITIAL_CHILD];
  });

  const [activeChildId, setActiveChildId] = useState<string>(() => {
    const saved = localStorage.getItem('tk_active_child_id');
    return saved || INITIAL_CHILD.id;
  });

  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(() => {
    const saved = localStorage.getItem('tk_growth_records');
    return saved ? JSON.parse(saved) : INITIAL_GROWTH_RECORDS;
  });

  const [memories, setMemories] = useState<ChildMemory[]>(() => {
    const saved = localStorage.getItem('tk_memories');
    return saved ? JSON.parse(saved) : INITIAL_MEMORIES;
  });

  const [vaccineLogs, setVaccineLogs] = useState<VaccineLog[]>(() => {
    const saved = localStorage.getItem('tk_vaccine_logs');
    return saved ? JSON.parse(saved) : INITIAL_VACCINE_LOGS;
  });

  const [milestoneHistory, setMilestoneHistory] = useState<MilestoneTestRecord[]>(() => {
    const saved = localStorage.getItem('tk_milestone_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Background Opacity & Wallpaper Theme state (Persisted)
  const [bgOpacity, setBgOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('tk_bg_opacity');
    return saved !== null ? parseInt(saved, 10) : 30;
  });
  const [wallpaperThemeId, setWallpaperThemeId] = useState<string>(() => {
    const saved = localStorage.getItem('tk_wallpaper_theme');
    return saved || 'classic_cream';
  });
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Google Drive user state
  const [driveUser, setDriveUser] = useState(auth.currentUser);

  const [activeTab, setActiveTab] = useState<MainTab>('beranda');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(false);

  // Quick Anthropometry Input Modal state
  const [inputWeight, setInputWeight] = useState('10.4');
  const [inputHeight, setInputHeight] = useState('81.2');
  const [inputHead, setInputHead] = useState('46.5');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputLocation, setInputLocation] = useState('Posyandu / Puskesmas');

  // Listen to Auth State
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setDriveUser(user);
    });
    return () => unsub();
  }, []);

  // Test Firestore Connection & Sync Firestore Collections on Mount
  useEffect(() => {
    testFirestoreConnection();

    async function syncFirestoreAndOnlineData() {
      // 1. Try Firestore First
      try {
        const firestoreChildren = await fetchAllChildrenFromFirestore();
        if (firestoreChildren && firestoreChildren.length > 0) {
          setChildrenList(firestoreChildren);
        }

        const firestoreRecords = await fetchGrowthRecordsFromFirestore(activeChildId);
        if (firestoreRecords && firestoreRecords.length > 0) {
          setGrowthRecords(firestoreRecords);
        }

        const firestoreVaccines = await fetchVaccineLogsFromFirestore(activeChildId);
        if (firestoreVaccines && firestoreVaccines.length > 0) {
          setVaccineLogs(firestoreVaccines);
        }

        const firestoreMemories = await fetchMemoriesFromFirestore(activeChildId);
        if (firestoreMemories && firestoreMemories.length > 0) {
          setMemories(firestoreMemories);
        }
      } catch (fsErr) {
        console.warn('Firestore initial sync notice, checking backend server sync:', fsErr);
      }

      // 2. Sync with local/server database for offline and server files
      try {
        const dbData = await fetchOnlineDatabase();
        if (dbData) {
          if (dbData.child) {
            setChildrenList((prev) => {
              const idx = prev.findIndex((c) => c.id === dbData.child!.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = dbData.child!;
                return next;
              }
              return [dbData.child!, ...prev];
            });
          }
          if (dbData.memories && dbData.memories.length > 0) {
            setMemories((prev) => (prev.length > 0 ? prev : dbData.memories!));
          }
          if (dbData.growthRecords && dbData.growthRecords.length > 0) {
            setGrowthRecords((prev) => (prev.length > 0 ? prev : dbData.growthRecords!));
          }
        }
      } catch (err) {
        console.warn('Gagal sinkron database server:', err);
      }
    }

    syncFirestoreAndOnlineData();
  }, [activeChildId]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tk_children', JSON.stringify(childrenList));
  }, [childrenList]);

  useEffect(() => {
    localStorage.setItem('tk_active_child_id', activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    localStorage.setItem('tk_growth_records', JSON.stringify(growthRecords));
  }, [growthRecords]);

  useEffect(() => {
    localStorage.setItem('tk_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('tk_vaccine_logs', JSON.stringify(vaccineLogs));
  }, [vaccineLogs]);

  useEffect(() => {
    localStorage.setItem('tk_milestone_history', JSON.stringify(milestoneHistory));
  }, [milestoneHistory]);

  useEffect(() => {
    localStorage.setItem('tk_bg_opacity', bgOpacity.toString());
  }, [bgOpacity]);

  useEffect(() => {
    localStorage.setItem('tk_wallpaper_theme', wallpaperThemeId);
  }, [wallpaperThemeId]);

  const activeTheme = WALLPAPER_THEMES.find((t) => t.id === wallpaperThemeId) || WALLPAPER_THEMES[0];
  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];
  const activeChildRecords = growthRecords.filter((r) => r.childId === activeChild?.id);
  const activeChildMemories = memories.filter((m) => m.childId === activeChild?.id);
  const activeChildVaccines = vaccineLogs.filter((v) => v.childId === activeChild?.id);

  const sortedRecords = [...activeChildRecords].sort((a, b) => a.ageMonths - b.ageMonths);
  const latestRecord = sortedRecords[sortedRecords.length - 1];

  // Handlers with Firestore & Online Real-time Persistence
  const handleSaveMemory = async (newMem: ChildMemory) => {
    setMemories((prev) => [newMem, ...prev]);
    try {
      await saveMemoryToFirestore(newMem);
    } catch (e) {
      console.warn('Gagal simpan memori ke Firestore:', e);
    }
  };

  const handleDeleteMemory = async (memId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memId));
    try {
      await deleteMemoryFromFirestore(memId);
      await deleteOnlineMemory(memId);
    } catch (e) {
      console.warn('Gagal menghapus memori di server/Firestore:', e);
    }
  };

  const handleUpdateChild = async (updated: ChildProfile) => {
    setChildrenList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    try {
      await saveChildToFirestore(updated);
      await saveOnlineChild(updated);
    } catch (e) {
      console.warn('Gagal simpan profil anak ke Firestore:', e);
    }
  };

  const handleAddRecord = async (newRec: GrowthRecord) => {
    setGrowthRecords((prev) => [...prev, newRec]);
    try {
      await saveGrowthRecordToFirestore(newRec);
      await saveOnlineGrowthRecord(newRec);
    } catch (e) {
      console.warn('Gagal simpan antropometri ke Firestore:', e);
    }
  };

  const handleDeleteRecord = async (recId: string) => {
    setGrowthRecords((prev) => prev.filter((r) => r.id !== recId));
    try {
      await deleteGrowthRecordFromFirestore(recId);
      await deleteOnlineGrowthRecord(recId);
    } catch (e) {
      console.warn('Gagal hapus antropometri dari Firestore:', e);
    }
  };

  const handleUpdateVaccineLog = async (log: VaccineLog) => {
    setVaccineLogs((prev) => {
      const idx = prev.findIndex((l) => l.vaccineId === log.vaccineId && l.childId === log.childId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = log;
        return updated;
      }
      return [...prev, log];
    });
    try {
      await saveVaccineLogToFirestore(log);
    } catch (e) {
      console.warn('Gagal simpan imunisasi ke Firestore:', e);
    }
  };

  const handleSaveAssessment = (record: MilestoneTestRecord) => {
    setMilestoneHistory((prev) => [...prev, record]);
  };

  const handleConnectDrive = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setDriveUser(res.user);
      }
    } catch (err: any) {
      console.error('Error connecting Google Drive:', err);
    }
  };

  const handleSaveAnthropometry = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(inputWeight);
    const h = parseFloat(inputHeight);
    const hc = inputHead ? parseFloat(inputHead) : undefined;
    if (!w || !h || isNaN(w) || isNaN(h)) return;

    const ageCalc = calculateAgeInMonths(activeChild.birthDate, inputDate);
    const status = evaluateGrowthStatus(activeChild.gender, ageCalc.months, w, h, hc);

    const newRecord: GrowthRecord = {
      id: `rec_${Date.now()}`,
      childId: activeChild.id,
      date: inputDate,
      ageMonths: ageCalc.months,
      weight: w,
      height: h,
      headCircumference: hc,
      location: inputLocation,
      status,
    };

    handleAddRecord(newRecord);
    setIsRecordModalOpen(false);
  };

  return (
    <div 
      className="min-h-screen text-slate-900 font-sans antialiased flex flex-col relative selection:bg-teal-100 selection:text-teal-900"
      style={{ backgroundColor: activeTheme.bgColor }}
    >
      {/* 
        Cute Baby Nursery Pattern / Wallpaper Background Layer 
        Supports multi-theme wallpapers and user-adjusted opacity
      */}
      {activeTheme.url && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url('${activeTheme.url}')`,
            backgroundRepeat: activeTheme.type === 'cover' ? 'no-repeat' : 'repeat',
            backgroundSize: activeTheme.type === 'cover' ? 'cover' : activeTheme.patternSize,
            backgroundPosition: activeTheme.type === 'cover' ? 'center top' : 'center',
            opacity: bgOpacity / 100,
          }}
        />
      )}

      {/* 1. Top Header Bar (Clean, spacious, ultra-clear for mobile screens) */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/94 backdrop-blur-md border-b border-stone-200/80 no-print">
        <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3">
          {/* Logo & Brand Wordmark - Prominent & unconstrained for mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight truncate">
                TumbuhKembang
              </h1>
              <p className="text-[11px] font-semibold text-teal-800/80 leading-none mt-0.5 truncate">
                Jurnal Ayah & Buah Hati
              </p>
            </div>
          </div>

          {/* Right Action: Clean 3-dots Menu Button */}
          <div className="flex items-center gap-2 shrink-0">
            {driveUser && (
              <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Drive Aktif</span>
              </div>
            )}

            {/* 3-dots Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowTopMenu(!showTopMenu)}
                className="w-9 h-9 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                title="Menu Pengaturan & Fitur Lengkap"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showTopMenu && (
                <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setIsUploadModalOpen(true);
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-teal-50 text-teal-900 font-extrabold flex items-center gap-2.5 cursor-pointer border-b border-stone-100 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                    <span>+ Unggah Foto & Video</span>
                  </button>

                  <PWAInstallButton variant="menu-item" />

                  <button
                    onClick={() => {
                      setIsEditProfileOpen(true);
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-800 font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ubah Biodata & Foto Anak</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsThemeModalOpen(true);
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Palette className="w-3.5 h-3.5 text-teal-600" />
                    <span>Ganti Tema Wallpaper & Opasitas ({bgOpacity}%)</span>
                  </button>

                  {driveUser ? (
                    <button
                      onClick={async () => {
                        await googleSignOut();
                        setDriveUser(null);
                        setShowTopMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Cloud className="w-3.5 h-3.5 text-rose-500" />
                      <span className="truncate">Putuskan Akun ({driveUser.email?.split('@')[0]})</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      exportChildDataToJson({
                        child: activeChild,
                        growthRecords: activeChildRecords,
                        vaccineLogs: activeChildVaccines,
                        memories: activeChildMemories,
                        milestoneHistory,
                      });
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-teal-50 text-teal-800 font-semibold flex items-center gap-2 cursor-pointer border-t border-stone-100"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Unduh Cadangan Data (JSON)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsReportOpen(true);
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-400" />
                    <span>Cetak Rekap Buku KIA</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('imunisasi');
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Jadwal Imunisasi</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('mpasi');
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    <span>Panduan MPASI Sehat</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('dokter_ai');
                      setShowTopMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-stone-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tanya Dokter Anak AI</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Subheader Tabs (Horizontally smooth scrolling for 100% mobile precision) */}
        <div className="max-w-2xl mx-auto px-3 sm:px-4 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {[
            { id: 'beranda', label: 'Beranda' },
            { id: 'kolase', label: 'Kolase' },
            { id: 'kurva_who', label: 'Kurva WHO' },
            { id: 'milestone', label: 'Milestone' },
            { id: 'imunisasi', label: 'Imunisasi' },
            { id: 'mpasi', label: 'MPASI' },
            { id: 'dokter_ai', label: 'Dokter AI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as MainTab)}
              className={`py-1.5 px-3 rounded-full transition-all cursor-pointer whitespace-nowrap text-xs font-bold shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs border border-stone-200'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-stone-100/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 pb-24 z-10 relative">
        {activeTab === 'beranda' && (
          <>
            <div className="mb-4">
              <WeeklyWisdomQuoteBar />
            </div>
            <HomeDashboardView
            child={activeChild}
            latestRecord={latestRecord}
            memories={activeChildMemories}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onOpenRecordModal={() => setIsRecordModalOpen(true)}
            onOpenEditProfileModal={() => setIsEditProfileOpen(true)}
            onNavigateTab={(tab) => {
              if (tab === 'growth') setActiveTab('kurva_who');
              else if (tab === 'milestones') setActiveTab('milestone');
              else if (tab === 'kolase') setActiveTab('kolase');
              else if (tab === 'consult') setActiveTab('dokter_ai');
            }}
            onDeleteMemory={handleDeleteMemory}
          />
        </>
      )}

        {activeTab === 'kolase' && (
          <KolaseView
            child={activeChild}
            memories={activeChildMemories}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onDeleteMemory={handleDeleteMemory}
          />
        )}

        {activeTab === 'kurva_who' && (
          <GrowthTrackerTab
            child={activeChild}
            records={activeChildRecords}
            onAddRecord={handleAddRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeTab === 'milestone' && (
          <MilestoneKPSPTab
            child={activeChild}
            milestoneHistory={milestoneHistory}
            onSaveAssessment={handleSaveAssessment}
          />
        )}

        {activeTab === 'imunisasi' && (
          <ImmunizationTab
            child={activeChild}
            vaccineLogs={activeChildVaccines}
            onUpdateVaccineLog={handleUpdateVaccineLog}
          />
        )}

        {activeTab === 'mpasi' && (
          <MPASITab child={activeChild} />
        )}

        {activeTab === 'dokter_ai' && (
          <AIConsultTab child={activeChild} latestRecord={latestRecord} />
        )}
      </main>

      {/* 3. Bottom Sticky Navigation Bar (Matching screenshot footer) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-stone-200 z-40 py-1.5 px-4 no-print shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button
            onClick={() => setActiveTab('beranda')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'beranda' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('kolase')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'kolase' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-bold">Kolase</span>
          </button>

          <button
            onClick={() => setActiveTab('kurva_who')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'kurva_who' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold">Kurva WHO</span>
          </button>

          <button
            onClick={() => setActiveTab('milestone')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer ${
              activeTab === 'milestone' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-bold">Milestone</span>
          </button>
        </div>
      </nav>

      {/* Edit Child Profile Modal */}
      {isEditProfileOpen && activeChild && (
        <EditProfileModal
          child={activeChild}
          onClose={() => setIsEditProfileOpen(false)}
          onSaveChild={handleUpdateChild}
        />
      )}

      {/* Upload Media Modal (Gallery & Direct Camera & Google Drive) */}
      {isUploadModalOpen && (
        <UploadMediaModal
          child={activeChild}
          latestWeight={latestRecord?.weight || 10.4}
          latestHeight={latestRecord?.height || 81.2}
          onClose={() => setIsUploadModalOpen(false)}
          onSaveMemory={handleSaveMemory}
        />
      )}

      {/* Quick Anthropometry Record Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Catat Antropometri</h3>
                  <p className="text-[11px] text-slate-400">{activeChild.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAnthropometry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Pengukuran</label>
                <input
                  type="date"
                  required
                  value={inputDate}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Berat Badan (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tinggi Badan (cm) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={inputHeight}
                    onChange={(e) => setInputHeight(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lingkar Kepala (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputHead}
                  onChange={(e) => setInputHead(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Pemeriksaan</label>
                <input
                  type="text"
                  value={inputLocation}
                  onChange={(e) => setInputLocation(e.target.value)}
                  placeholder="Posyandu Mawar / Puskesmas"
                  className="w-full text-xs px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Simpan Pengukuran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rekap Buku KIA Print Modal */}
      {isReportOpen && activeChild && (
        <KIAReportModal
          child={activeChild}
          records={activeChildRecords}
          vaccineLogs={activeChildVaccines}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Wallpaper Theme & Opacity Selector Modal */}
      {isThemeModalOpen && (
        <ThemeSelectorModal
          currentThemeId={wallpaperThemeId}
          bgOpacity={bgOpacity}
          onSelectTheme={(themeId) => setWallpaperThemeId(themeId)}
          onChangeOpacity={(val) => setBgOpacity(val)}
          onClose={() => setIsThemeModalOpen(false)}
        />
      )}

      {/* Floating Transparent Doctor AI & FAQ Widget */}
      <FloatingDoctorAIWidget
        child={activeChild}
        latestRecord={latestRecord}
        onNavigateToDoctorConsult={() => setActiveTab('dokter_ai')}
      />
    </div>
  );
}
