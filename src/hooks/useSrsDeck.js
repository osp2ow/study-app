import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  subscribeToDeckProgress,
  saveDeckProgress,
  seedMissingItems,
  setBookmark,
} from '../firebase';
import { scheduleNext, getStatus, isDue } from '../lib/srs';

/**
 * 단어장/문법 등 어떤 "덱"에도 재사용 가능한 SRS 진도 관리 훅
 * @param {object|null} user - Firebase auth user
 * @param {string} deckName - Firestore 서브컬렉션 이름 (예: 'words', 'grammar')
 * @param {Array} masterList - 로컬 JSON 마스터 데이터 (id 필드 필수)
 */
export function useSrsDeck(user, deckName, masterList) {
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const uid = user?.uid ?? null;

  useEffect(() => {
    setSeeded(false);
  }, [deckName]);

  // Firestore 실시간 구독 → PC/모바일 동기화의 핵심
  useEffect(() => {
    if (!uid) {
      setProgress({});
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToDeckProgress(uid, deckName, (data) => {
      setProgress(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid, deckName]);

  // 최초 로그인 시, 아직 학습 기록이 없는 항목들을 시딩
  useEffect(() => {
    if (!uid || loading || seeded) return;
    const existingIds = new Set(Object.keys(progress));
    seedMissingItems(uid, deckName, masterList, existingIds).then(() =>
      setSeeded(true)
    );
  }, [uid, deckName, loading, seeded, progress, masterList]);

  const items = useMemo(() => {
    return masterList.map((item) => {
      const srs = progress[item.id];
      return {
        ...item,
        srs,
        status: getStatus(srs),
        due: isDue(srs),
        sourceDeck: deckName,
      };
    });
  }, [progress, masterList, deckName]);

  const dueItems = useMemo(() => items.filter((i) => i.due), [items]);

  const submitReview = useCallback(
    async (itemId, quality) => {
      if (!uid) return;
      const current = progress[itemId];
      const next = scheduleNext(current, quality);
      // 낙관적 업데이트: Firestore 응답 기다리지 않고 즉시 UI 반영
      setProgress((prev) => ({ ...prev, [itemId]: { ...current, ...next } }));
      await saveDeckProgress(uid, deckName, itemId, next);
    },
    [uid, deckName, progress]
  );

  const toggleBookmark = useCallback(
    async (itemId, nextValue) => {
      if (!uid) return;
      const current = progress[itemId];
      const value = nextValue ?? !(current?.bookmarked);
      setProgress((prev) => ({
        ...prev,
        [itemId]: { ...prev[itemId], bookmarked: value },
      }));
      await setBookmark(uid, deckName, itemId, value);
    },
    [uid, deckName, progress]
  );

  const bookmarkedItems = useMemo(
    () => items.filter((i) => i.srs?.bookmarked),
    [items]
  );

  const stats = useMemo(() => {
    const total = items.length;
    const due = dueItems.length;
    const mastered = items.filter((i) => i.status === 'mastered').length;
    return { total, due, mastered };
  }, [items, dueItems]);

  return { items, dueItems, bookmarkedItems, loading, submitReview, toggleBookmark, stats };
}
