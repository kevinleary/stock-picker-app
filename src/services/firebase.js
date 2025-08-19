import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInAnonymously as fbSignInAnonymously,
    onAuthStateChanged as fbOnAuthStateChanged,
    signInWithCustomToken as fbSignInWithCustomToken
} from 'firebase/auth';
import {
    getFirestore,
    collection as fbCollection,
    doc as fbDoc,
    setDoc as fbSetDoc,
    onSnapshot as fbOnSnapshot,
    deleteDoc as fbDeleteDoc
} from 'firebase/firestore';

// Firebase configuration - will be provided by the environment
const firebaseConfig = typeof window.__firebase_config !== 'undefined' ? JSON.parse(window.__firebase_config) : {};
export const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-stock-app';

let db, auth;
let collection, doc, setDoc, onSnapshot, deleteDoc;
let signInAnonymously, onAuthStateChanged, signInWithCustomToken;

const isFirebaseConfigured = Object.keys(firebaseConfig).length > 0;

if (isFirebaseConfigured) {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        signInAnonymously = fbSignInAnonymously;
        onAuthStateChanged = fbOnAuthStateChanged;
        signInWithCustomToken = fbSignInWithCustomToken;
        collection = fbCollection;
        doc = fbDoc;
        setDoc = fbSetDoc;
        onSnapshot = fbOnSnapshot;
        deleteDoc = fbDeleteDoc;
    } catch (e) {
        console.error("Firebase init error", e);
    }
} else {
    console.log("Using mock Firebase service");
    auth = {}; // Mock auth object
    db = {}; // Mock db object

    signInAnonymously = (auth) => Promise.resolve({ user: { uid: 'mock-user' } });
    onAuthStateChanged = (auth, callback) => {
        callback({ uid: 'mock-user' });
        return () => { }; // Return an unsubscribe function
    };
    signInWithCustomToken = (auth, token) => Promise.resolve({ user: { uid: 'mock-user' } });

    collection = (db, path) => ({});
    doc = (db, path, id) => ({});
    setDoc = (docRef, data) => Promise.resolve();
    onSnapshot = (query, callback) => {
        callback({ forEach: (cb) => {} }); // Immediately return empty snapshot
        return () => { }; // Return an unsubscribe function
    };
    deleteDoc = (docRef) => Promise.resolve();
}

export {
    db,
    auth,
    signInAnonymously,
    onAuthStateChanged,
    signInWithCustomToken,
    collection,
    doc,
    setDoc,
    onSnapshot,
    deleteDoc
};
