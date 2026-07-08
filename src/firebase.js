import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCc__tTddKVmbMEvVxVBK0EdiRsLIoljGQ",
  authDomain: "jp-study-5d3ef.firebaseapp.com",
  projectId: "jp-study-5d3ef",
  storageBucket: "jp-study-5d3ef.firebasestorage.app",
  messagingSenderId: "187509468168",
  appId: "1:187509468168:web:133cc49a5b9f60ebbcf5bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function signOutUser() {
  return signOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function subscribeToDeckProgress(uid, deckName, callback) {
  const colRef = collection(db, 'users', uid, deckName);
  return onSnapshot(colRef, (snapshot) => {
    const progress = {};
    snapshot.forEach((docSnap) => {
      progress[docSnap.id] = docSnap.data();
    });
    callback(progress);
  });
}

export function saveDeckProgress(uid, deckName, itemId, srsData) {
  const ref = doc(db, 'users', uid, deckName, itemId);
  return setDoc(
    ref,
    { ...srsData, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function seedMissingItems(uid, deckName, masterList, existingIds) {
  const missing = masterList.filter((item) => !existingIds.has(item.id));
  if (missing.length === 0) return;

  const batch = writeBatch(db);
  missing.forEach((item) => {
    const ref = doc(db, 'users', uid, deckName, item.id);
    batch.set(ref, {
      repetition: 0,
      easeFactor: 2.5,
      interval: 0,
      nextReview: new Date().toISOString(),
      lastReviewed: null,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export function setBookmark(uid, deckName, itemId, bookmarked) {
  const ref = doc(db, 'users', uid, deckName, itemId);
  return setDoc(ref, { bookmarked, updatedAt: serverTimestamp() }, { merge: true });
}
