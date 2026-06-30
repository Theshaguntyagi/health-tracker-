import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch,
  Firestore
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import type { UserProfile, WeightEntry, FoodEntry, WaterEntry, SleepEntry, ActivityEntry, HealthRecord, AIReport, ChatMessage, FirebaseConfig } from '../types';

// --- INDEXED DB FOR LOCAL PROGRESS PHOTOS ---
const DB_NAME = 'HealthTrackerLocalDB';
const STORE_NAME = 'progress_photos';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalPhoto(id: string, type: 'front' | 'side' | 'back', base64Data: string, date: string): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ id, type, base64Data, date });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLocalPhotos(): Promise<{ id: string, type: 'front' | 'side' | 'back', base64Data: string, date: string }[]> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteLocalPhoto(id: string): Promise<void> {
  const db = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// --- FIREBASE INITIALIZATION ---
let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let firebaseStorage: FirebaseStorage | null = null;

export function initFirebase(config: FirebaseConfig): boolean {
  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);
    return true;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    return false;
  }
}

// --- DATA ACCESS LAYER ---
export let USER_ID = 'shagun_tyagi'; // Fallback user ID

// Listen to auth state changes to update USER_ID dynamically
setTimeout(() => {
  try {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        USER_ID = user.uid;
        console.log("Firebase Auth User ID active:", USER_ID);
      } else {
        USER_ID = 'shagun_tyagi';
        console.log("Guest User ID active:", USER_ID);
      }
    });
  } catch (e) {
    console.warn("Auth state listener not initialized yet.");
  }
}, 100);

// Helper to get local data
function getLocal<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Helper to set local data
function setLocal<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const dbService = {
  // 1. User Profile
  async getUserProfile(isFirebase: boolean): Promise<UserProfile | null> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    }
    return getLocal<UserProfile | null>('user_profile', {
      name: 'User',
      age: 30,
      height: 175,
      startWeight: 100,
      targetWeight: 80,
      dailyGoals: {
        calories: 2000,
        protein: 140,
        water: 3000,
        sleep: 8,
        steps: 10000
      }
    });
  },

  async saveUserProfile(profile: UserProfile, isFirebase: boolean): Promise<void> {
    setLocal('user_profile', profile);
    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID);
      await setDoc(docRef, profile);
    }
  },

  // 2. Weight Entries
  async getWeightEntries(isFirebase: boolean): Promise<WeightEntry[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'weights');
      const querySnapshot = await getDocs(colRef);
      const entries: WeightEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as WeightEntry);
      });
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    }
    return getLocal<WeightEntry[]>('weight_entries', []).sort((a, b) => b.date.localeCompare(a.date));
  },

  async saveWeightEntry(entry: WeightEntry, isFirebase: boolean): Promise<void> {
    const entries = getLocal<WeightEntry[]>('weight_entries', []);
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    setLocal('weight_entries', entries);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'weights', entry.id);
      await setDoc(docRef, entry);
    }
  },

  async deleteWeightEntry(id: string, isFirebase: boolean): Promise<void> {
    const entries = getLocal<WeightEntry[]>('weight_entries', []);
    setLocal('weight_entries', entries.filter(e => e.id !== id));

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'weights', id);
      await deleteDoc(docRef);
    }
  },

  // 3. Food Logs
  async getFoodEntries(isFirebase: boolean): Promise<FoodEntry[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'food_logs');
      const querySnapshot = await getDocs(colRef);
      const entries: FoodEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as FoodEntry);
      });
      return entries;
    }
    return getLocal<FoodEntry[]>('food_entries', []);
  },

  async saveFoodEntry(entry: FoodEntry, isFirebase: boolean): Promise<void> {
    const entries = getLocal<FoodEntry[]>('food_entries', []);
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    setLocal('food_entries', entries);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'food_logs', entry.id);
      await setDoc(docRef, entry);
    }
  },

  async deleteFoodEntry(id: string, isFirebase: boolean): Promise<void> {
    const entries = getLocal<FoodEntry[]>('food_entries', []);
    setLocal('food_entries', entries.filter(e => e.id !== id));

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'food_logs', id);
      await deleteDoc(docRef);
    }
  },

  // 4. Water Logs
  async getWaterEntries(isFirebase: boolean): Promise<WaterEntry[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'water_logs');
      const querySnapshot = await getDocs(colRef);
      const entries: WaterEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as WaterEntry);
      });
      return entries;
    }
    return getLocal<WaterEntry[]>('water_entries', []);
  },

  async saveWaterEntry(entry: WaterEntry, isFirebase: boolean): Promise<void> {
    const entries = getLocal<WaterEntry[]>('water_entries', []);
    entries.push(entry);
    setLocal('water_entries', entries);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'water_logs', entry.id);
      await setDoc(docRef, entry);
    }
  },

  async deleteWaterEntry(id: string, isFirebase: boolean): Promise<void> {
    const entries = getLocal<WaterEntry[]>('water_entries', []);
    setLocal('water_entries', entries.filter(e => e.id !== id));

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'water_logs', id);
      await deleteDoc(docRef);
    }
  },

  // 5. Sleep Logs
  async getSleepEntries(isFirebase: boolean): Promise<SleepEntry[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'sleep_logs');
      const querySnapshot = await getDocs(colRef);
      const entries: SleepEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as SleepEntry);
      });
      return entries;
    }
    return getLocal<SleepEntry[]>('sleep_entries', []);
  },

  async saveSleepEntry(entry: SleepEntry, isFirebase: boolean): Promise<void> {
    const entries = getLocal<SleepEntry[]>('sleep_entries', []);
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    setLocal('sleep_entries', entries);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'sleep_logs', entry.id);
      await setDoc(docRef, entry);
    }
  },

  async deleteSleepEntry(id: string, isFirebase: boolean): Promise<void> {
    const entries = getLocal<SleepEntry[]>('sleep_entries', []);
    setLocal('sleep_entries', entries.filter(e => e.id !== id));

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'sleep_logs', id);
      await deleteDoc(docRef);
    }
  },

  // 6. Activity Logs
  async getActivityEntries(isFirebase: boolean): Promise<ActivityEntry[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'activities');
      const querySnapshot = await getDocs(colRef);
      const entries: ActivityEntry[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as ActivityEntry);
      });
      return entries;
    }
    return getLocal<ActivityEntry[]>('activity_entries', []);
  },

  async saveActivityEntry(entry: ActivityEntry, isFirebase: boolean): Promise<void> {
    const entries = getLocal<ActivityEntry[]>('activity_entries', []);
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    setLocal('activity_entries', entries);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'activities', entry.id);
      await setDoc(docRef, entry);
    }
  },

  async deleteActivityEntry(id: string, isFirebase: boolean): Promise<void> {
    const entries = getLocal<ActivityEntry[]>('activity_entries', []);
    setLocal('activity_entries', entries.filter(e => e.id !== id));

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'activities', id);
      await deleteDoc(docRef);
    }
  },

  // 7. Health Records
  async getHealthRecords(isFirebase: boolean): Promise<HealthRecord[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'health_records');
      const querySnapshot = await getDocs(colRef);
      const entries: HealthRecord[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as HealthRecord);
      });
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    }
    return getLocal<HealthRecord[]>('health_records', []).sort((a, b) => b.date.localeCompare(a.date));
  },

  async saveHealthRecord(entry: HealthRecord, isFirebase: boolean): Promise<void> {
    const entries = getLocal<HealthRecord[]>('health_records', []);
    const index = entries.findIndex(e => e.id === entry.id);
    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }
    setLocal('health_records', entries);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'health_records', entry.id);
      await setDoc(docRef, entry);
    }
  },

  async deleteHealthRecord(id: string, isFirebase: boolean): Promise<void> {
    const entries = getLocal<HealthRecord[]>('health_records', []);
    setLocal('health_records', entries.filter(e => e.id !== id));

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'health_records', id);
      await deleteDoc(docRef);
    }
  },

  // 8. AI Reports
  async getAIReports(isFirebase: boolean): Promise<AIReport[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'ai_reports');
      const querySnapshot = await getDocs(colRef);
      const entries: AIReport[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as AIReport);
      });
      return entries.sort((a, b) => b.date.localeCompare(a.date));
    }
    return getLocal<AIReport[]>('ai_reports', []).sort((a, b) => b.date.localeCompare(a.date));
  },

  async saveAIReport(report: AIReport, isFirebase: boolean): Promise<void> {
    const reports = getLocal<AIReport[]>('ai_reports', []);
    const index = reports.findIndex(r => r.id === report.id);
    if (index >= 0) {
      reports[index] = report;
    } else {
      reports.push(report);
    }
    setLocal('ai_reports', reports);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'ai_reports', report.id);
      await setDoc(docRef, report);
    }
  },

  // 9. Chat Messages (stored locally by default, can be synced)
  async getChatMessages(isFirebase: boolean): Promise<ChatMessage[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'chat_messages');
      const querySnapshot = await getDocs(colRef);
      const entries: ChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        entries.push(doc.data() as ChatMessage);
      });
      return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }
    return getLocal<ChatMessage[]>('chat_messages', []).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  },

  async saveChatMessage(message: ChatMessage, isFirebase: boolean): Promise<void> {
    const messages = getLocal<ChatMessage[]>('chat_messages', []);
    messages.push(message);
    setLocal('chat_messages', messages);

    const db = firestoreDb;
    if (isFirebase && db) {
      const docRef = doc(db, 'users', USER_ID, 'chat_messages', message.id);
      await setDoc(docRef, message);
    }
  },

  async clearChatMessages(isFirebase: boolean): Promise<void> {
    setLocal('chat_messages', []);
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'chat_messages');
      const querySnapshot = await getDocs(colRef);
      const batch = writeBatch(db);
      querySnapshot.forEach((document) => {
        batch.delete(document.ref);
      });
      await batch.commit();
    }
  },

  // 10. Progress Photos
  async getProgressPhotos(isFirebase: boolean): Promise<{ id: string, type: 'front' | 'side' | 'back', url: string, date: string }[]> {
    const db = firestoreDb;
    if (isFirebase && db) {
      const colRef = collection(db, 'users', USER_ID, 'progress_photos');
      const querySnapshot = await getDocs(colRef);
      const photos: any[] = [];
      querySnapshot.forEach((doc) => {
        photos.push(doc.data());
      });
      return photos.sort((a, b) => b.date.localeCompare(a.date));
    }
    const localPhotos = await getLocalPhotos();
    return localPhotos.map(p => ({
      id: p.id,
      type: p.type,
      url: p.base64Data, // In local mode, the URL is just the Base64 string
      date: p.date
    })).sort((a, b) => b.date.localeCompare(a.date));
  },

  async saveProgressPhoto(id: string, type: 'front' | 'side' | 'back', fileOrBase64: string, date: string, isFirebase: boolean): Promise<string> {
    const db = firestoreDb;
    if (isFirebase && db && firebaseStorage) {
      // In firebase mode, we upload the base64 string to Firebase Storage
      const storageRef = ref(firebaseStorage, `users/${USER_ID}/photos/${id}`);
      await uploadString(storageRef, fileOrBase64, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      const photoDoc = { id, type, url: downloadUrl, date };
      const docRef = doc(db, 'users', USER_ID, 'progress_photos', id);
      await setDoc(docRef, photoDoc);
      return downloadUrl;
    } else {
      await saveLocalPhoto(id, type, fileOrBase64, date);
      return fileOrBase64;
    }
  },

  async deleteProgressPhoto(id: string, isFirebase: boolean): Promise<void> {
    const db = firestoreDb;
    if (isFirebase && db && firebaseStorage) {
      const docRef = doc(db, 'users', USER_ID, 'progress_photos', id);
      await deleteDoc(docRef);
      try {
        const storageRef = ref(firebaseStorage, `users/${USER_ID}/photos/${id}`);
        await deleteObject(storageRef);
      } catch (err) {
        console.error("Failed to delete photo from storage:", err);
      }
    } else {
      await deleteLocalPhoto(id);
    }
  },

  // 11. Sync Local Data to Firebase
  async syncLocalDataToFirebase(): Promise<void> {
    const db = firestoreDb;
    if (!db) throw new Error("Firebase not initialized");

    const batch = writeBatch(db);

    // 1. Sync Profile
    const profile = getLocal<UserProfile | null>('user_profile', null);
    if (profile) {
      const profileRef = doc(db, 'users', USER_ID);
      batch.set(profileRef, profile);
    }

    // 2. Sync Weights
    const weights = getLocal<WeightEntry[]>('weight_entries', []);
    weights.forEach(w => {
      const docRef = doc(db, 'users', USER_ID, 'weights', w.id);
      batch.set(docRef, w);
    });

    // 3. Sync Foods
    const foods = getLocal<FoodEntry[]>('food_entries', []);
    foods.forEach(f => {
      const docRef = doc(db, 'users', USER_ID, 'food_logs', f.id);
      batch.set(docRef, f);
    });

    // 4. Sync Water
    const water = getLocal<WaterEntry[]>('water_entries', []);
    water.forEach(w => {
      const docRef = doc(db, 'users', USER_ID, 'water_logs', w.id);
      batch.set(docRef, w);
    });

    // 5. Sync Sleep
    const sleep = getLocal<SleepEntry[]>('sleep_entries', []);
    sleep.forEach(s => {
      const docRef = doc(db, 'users', USER_ID, 'sleep_logs', s.id);
      batch.set(docRef, s);
    });

    // 6. Sync Activities
    const activities = getLocal<ActivityEntry[]>('activity_entries', []);
    activities.forEach(a => {
      const docRef = doc(db, 'users', USER_ID, 'activities', a.id);
      batch.set(docRef, a);
    });

    // 7. Sync Health Records
    const records = getLocal<HealthRecord[]>('health_records', []);
    records.forEach(r => {
      const docRef = doc(db, 'users', USER_ID, 'health_records', r.id);
      batch.set(docRef, r);
    });

    // 8. Sync AI Reports
    const reports = getLocal<AIReport[]>('ai_reports', []);
    reports.forEach(r => {
      const docRef = doc(db, 'users', USER_ID, 'ai_reports', r.id);
      batch.set(docRef, r);
    });

    // 9. Sync Chat Messages
    const messages = getLocal<ChatMessage[]>('chat_messages', []);
    messages.forEach(m => {
      const docRef = doc(db, 'users', USER_ID, 'chat_messages', m.id);
      batch.set(docRef, m);
    });

    await batch.commit();

    // 10. Sync Photos (Since photos are files, we upload them one by one)
    const localPhotos = await getLocalPhotos();
    if (firebaseStorage) {
      for (const photo of localPhotos) {
        const storageRef = ref(firebaseStorage, `users/${USER_ID}/photos/${photo.id}`);
        await uploadString(storageRef, photo.base64Data, 'data_url');
        const downloadUrl = await getDownloadURL(storageRef);
        const photoDoc = { id: photo.id, type: photo.type, url: downloadUrl, date: photo.date };
        const docRef = doc(db, 'users', USER_ID, 'progress_photos', photo.id);
        await setDoc(docRef, photoDoc);
      }
    }
  },

  // 12. Authentication Methods
  async signIn(email: string, pass: string): Promise<any> {
    const authInstance = getAuth();
    try {
      return await signInWithEmailAndPassword(authInstance, email, pass);
    } catch (err: any) {
      console.warn("Sign in failed, attempting auto-signup:", err.code);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          const credential = await createUserWithEmailAndPassword(authInstance, email, pass);
          console.log("Auto-signup successful for:", email);
          return credential;
        } catch (signUpErr: any) {
          console.error("Auto-signup failed:", signUpErr);
          if (signUpErr.code === 'auth/operation-not-allowed') {
            throw new Error('Email/Password sign-in is disabled. Please enable "Email/Password" in your Firebase Console -> Authentication -> Sign-in method.');
          }
          throw signUpErr;
        }
      }
      if (err.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password sign-in is disabled. Please enable "Email/Password" in your Firebase Console -> Authentication -> Sign-in method.');
      }
      throw err;
    }
  },

  async signOut(): Promise<void> {
    const authInstance = getAuth();
    return signOut(authInstance);
  }
};
