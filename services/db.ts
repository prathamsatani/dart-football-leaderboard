import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, setDoc, deleteDoc, doc, query, writeBatch } from "firebase/firestore";
import { Player } from '../types';

// =================================================================================
// CONFIGURATION: FIREBASE
// To enable Real-time Sync across devices:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project
// 3. Add a Web App to get these configuration values
// 4. Paste them below
// =================================================================================
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDzzgpWA6e1Ve3dygZ_ZbjphTMqRi97nO8",
  authDomain: "rc-car-racing-f134d.firebaseapp.com",
  projectId: "rc-car-racing-f134d",
  storageBucket: "rc-car-racing-f134d.firebasestorage.app",
  messagingSenderId: "662223021044",
  appId: "1:662223021044:web:0ba9e60771ea35925d0fa1",
  measurementId: "G-78YY4PDY6T"
};

// Check if config is set (basic check)
const isFirebaseConfigured = FIREBASE_CONFIG.apiKey !== "AIzaSyDzzgpWA6e1Ve3dygZ_ZbjphTMqRi97nO8`";
console.log("Firebase Configured:", isFirebaseConfigured);

let firestore: any = null;

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    firestore = getFirestore(app);
    console.log("Firebase initialized successfully. Sync enabled.");
  } catch (err) {
    console.error("Firebase initialization failed:", err);
  }
} else {
  console.warn("Firebase not configured. Using local IndexedDB. Data will NOT sync across devices.");
}

const COLLECTION_NAME = 'dart-football';

// =================================================================================
// FALLBACK: INDEXEDDB (If Firebase is not configured)
// =================================================================================
const DB_NAME = 'NexusLeaderboardDB';
const DB_VERSION = 1;
const STORE_NAME = 'players';

const idb = {
  init: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = (event) => {
        const database = (event.target as IDBOpenDBRequest).result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  },
  getAll: async (): Promise<Player[]> => {
    const database = await idb.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },
  put: async (player: Player): Promise<void> => {
    const database = await idb.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(player);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
  delete: async (id: string): Promise<void> => {
    const database = await idb.init();
    return new Promise((resolve, reject) => {
      const tx = database.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// Event emitter for local fallback to simulate subscriptions
const localSubscribers: Set<(players: Player[]) => void> = new Set();
const notifyLocalSubscribers = async () => {
    const players = await idb.getAll();
    localSubscribers.forEach(cb => cb(players));
};

// =================================================================================
// UNIFIED DB SERVICE
// =================================================================================

let useFallback = false;

export const db = {
  subscribe: (callback: (players: Player[]) => void) => {
    let unsubscribeFirestore: (() => void) | undefined;

    const startLocal = () => {
        localSubscribers.add(callback);
        idb.getAll().then(callback);
    };

    if (firestore && !useFallback) {
      // FIREBASE REALTIME LISTENER
      const q = query(collection(firestore, COLLECTION_NAME));
      unsubscribeFirestore = onSnapshot(q, (querySnapshot) => {
        const players: Player[] = [];
        querySnapshot.forEach((doc) => {
          players.push(doc.data() as Player);
        });
        callback(players);
      }, (error) => {
          console.error("Sync Error:", error);
          if (error.code === 'permission-denied' || error.code === 'unavailable') {
             console.warn("Switching to local IndexedDB fallback due to error:", error.code);
             useFallback = true;
             startLocal();
          }
      });
    } else {
      startLocal();
    }
      
    return () => {
        if (unsubscribeFirestore) unsubscribeFirestore();
        localSubscribers.delete(callback);
    };
  },

  addPlayer: async (player: Player) => {
     if (firestore && !useFallback) {
        try {
            await setDoc(doc(firestore, COLLECTION_NAME, player.id), player);
        } catch (err: any) {
            console.error("Firebase write failed:", err);
            if (err.code === 'permission-denied' || err.code === 'unavailable') {
                 useFallback = true;
                 await idb.put(player);
                 await notifyLocalSubscribers();
            } else {
                throw err;
            }
        }
     } else {
        await idb.put(player);
        await notifyLocalSubscribers();
     }
  },

  deletePlayer: async (id: string) => {
     if (firestore && !useFallback) {
        try {
            await deleteDoc(doc(firestore, COLLECTION_NAME, id));
        } catch (err: any) {
             console.error("Firebase delete failed:", err);
             if (err.code === 'permission-denied' || err.code === 'unavailable') {
                 useFallback = true;
                 await idb.delete(id);
                 await notifyLocalSubscribers();
            } else {
                throw err;
            }
        }
     } else {
        await idb.delete(id);
        await notifyLocalSubscribers();
     }
  },

  seed: async (players: Player[]) => {
      if (firestore && !useFallback) {
          try {
            const batch = writeBatch(firestore);
            players.forEach(p => {
                const ref = doc(firestore, COLLECTION_NAME, p.id);
                batch.set(ref, p);
            });
            await batch.commit();
          } catch (err: any) {
             console.error("Firebase seed failed:", err);
             if (err.code === 'permission-denied' || err.code === 'unavailable') {
                 useFallback = true;
                 for (const p of players) {
                    await idb.put(p);
                 }
                 await notifyLocalSubscribers();
            } else {
                throw err;
            }
          }
      } else {
          for (const p of players) {
              await idb.put(p);
          }
          await notifyLocalSubscribers();
      }
  },
  
  isConfigured: () => isFirebaseConfigured
};