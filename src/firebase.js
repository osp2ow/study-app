import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

// ⚠️ 이 부분만 본인 Firebase 프로젝트 값으로 교체하세요.
// Firebase Console > 설정 > 일반 > 내 앱 에서 확인 가능합니다.
const firebaseConfig = {
  apiKey: 'AIzaSyCc__tTddKVmbMEvVxVBK0EdiRsLIoljGQ',
  authDomain: 'jp-study-5d3ef.firebaseapp.com',
  projectId: 'jp-study-5d3ef',
  storageBucket: 'jp-study-5d3ef.firebasestorage.app',
  messagingSenderId: '187509468168',
  appId: '1:187509468168:web:133cc49a5b9f60ebbcf5bd',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 이메일/비밀번호 방식 - 구글 로그인보다 설정이 간단하고 정적 호스팅에서도 문제없이 동작함
export function signUpWithEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signInWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

// 유저의 학습 진도(SRS 상태)를 실시간 구독
// deckName: 'words' | 'grammar' 등 - 콘텐츠 종류별로 별도 서브컬렉션 사용
// PC에서 복습하면 모바일 화면에도 즉시 반영됨
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

// 항목 하나의 SRS 상태 저장 (복습 후 호출)
export function saveDeckProgress(uid, deckName, itemId, srsData) {
  const ref = doc(db, 'users', uid, deckName, itemId);
  return setDoc(
    ref,
    { ...srsData, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// 최초 로그인 시, 마스터 목록 중 아직 유저 데이터가 없는 항목들을 'new' 상태로 시딩
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

// "복습에 추가" 버튼 - 항목을 복습노트(북마크)에 넣거나 뺌
export function setBookmark(uid, deckName, itemId, bookmarked) {
  const ref = doc(db, 'users', uid, deckName, itemId);
  return setDoc(ref, { bookmarked, updatedAt: serverTimestamp() }, { merge: true });
}
