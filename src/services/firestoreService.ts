import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ChildProfile, GrowthRecord, VaccineLog, ChildMemory, MilestoneTestRecord } from '../types';

/**
 * 1. Child Profile Firestore CRUD
 */
export async function saveChildToFirestore(child: ChildProfile): Promise<void> {
  const path = `children/${child.id}`;
  try {
    await setDoc(doc(db, 'children', child.id), {
      ...child,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchChildFromFirestore(childId: string): Promise<ChildProfile | null> {
  const path = `children/${childId}`;
  try {
    const snap = await getDoc(doc(db, 'children', childId));
    if (snap.exists()) {
      return snap.data() as ChildProfile;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function fetchAllChildrenFromFirestore(): Promise<ChildProfile[]> {
  const path = 'children';
  try {
    const snap = await getDocs(collection(db, 'children'));
    return snap.docs.map((d) => d.data() as ChildProfile);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * 2. Growth Records Firestore CRUD
 */
export async function saveGrowthRecordToFirestore(record: GrowthRecord): Promise<void> {
  const path = `growthRecords/${record.id}`;
  try {
    await setDoc(doc(db, 'growthRecords', record.id), record);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteGrowthRecordFromFirestore(recordId: string): Promise<void> {
  const path = `growthRecords/${recordId}`;
  try {
    await deleteDoc(doc(db, 'growthRecords', recordId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchGrowthRecordsFromFirestore(childId: string): Promise<GrowthRecord[]> {
  const path = 'growthRecords';
  try {
    const q = query(collection(db, 'growthRecords'), where('childId', '==', childId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as GrowthRecord);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * 3. Vaccine Logs Firestore CRUD
 */
export async function saveVaccineLogToFirestore(log: VaccineLog): Promise<void> {
  const logId = log.id || `${log.childId}_${log.vaccineId}`;
  const path = `vaccineLogs/${logId}`;
  try {
    await setDoc(doc(db, 'vaccineLogs', logId), { ...log, id: logId });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function fetchVaccineLogsFromFirestore(childId: string): Promise<VaccineLog[]> {
  const path = 'vaccineLogs';
  try {
    const q = query(collection(db, 'vaccineLogs'), where('childId', '==', childId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as VaccineLog);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * 4. Memories & Media Firestore CRUD
 */
export async function saveMemoryToFirestore(memory: ChildMemory): Promise<void> {
  const path = `memories/${memory.id}`;
  try {
    await setDoc(doc(db, 'memories', memory.id), memory);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteMemoryFromFirestore(memoryId: string): Promise<void> {
  const path = `memories/${memoryId}`;
  try {
    await deleteDoc(doc(db, 'memories', memoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchMemoriesFromFirestore(childId: string): Promise<ChildMemory[]> {
  const path = 'memories';
  try {
    const q = query(collection(db, 'memories'), where('childId', '==', childId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as ChildMemory);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

/**
 * 5. Full Data Backup & Download Feature
 * Allows parents to download all child growth records, profile, vaccines, and notes to a clean JSON file
 */
export function exportChildDataToJson(data: {
  child: ChildProfile;
  growthRecords: GrowthRecord[];
  vaccineLogs: VaccineLog[];
  memories: ChildMemory[];
  milestoneHistory?: MilestoneTestRecord[];
}): void {
  const exportPayload = {
    appName: 'TumbuhKembang - Jurnal Buah Hati & KMS Digital',
    exportDate: new Date().toISOString(),
    ...data,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const cleanName = data.child.name.replace(/[^a-zA-Z0-9]/g, '_');
  const a = document.createElement('a');
  a.href = url;
  a.download = `Data_TumbuhKembang_${cleanName}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
