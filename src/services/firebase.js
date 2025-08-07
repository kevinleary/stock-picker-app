import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

// Firebase configuration - will be provided by the environment
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-stock-app';

let db, auth;

try {
    if (Object.keys(firebaseConfig).length > 0) {
         const app = initializeApp(firebaseConfig);
         db = getFirestore(app);
         auth = getAuth(app);
    }
} catch (e) {
    console.error("Firebase init error", e);
}

export { db, auth, signInAnonymously, onAuthStateChanged, signInWithCustomToken, collection, doc, setDoc, onSnapshot, deleteDoc };
