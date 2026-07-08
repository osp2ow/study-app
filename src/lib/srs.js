// SM-2 알고리즘 기반 SRS (Anki 스타일 4버튼: 다시 / 어려움 / 좋음 / 쉬움)
// quality 매핑: 다시=0, 어려움=3, 좋음=4, 쉬움=5

export const RATING = {
  AGAIN: 0,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 이전 SRS 상태 + 이번 평가(quality)를 받아 다음 SRS 상태를 계산
 * @param {{ repetition?: number, easeFactor?: number, interval?: number }} prev
 * @param {number} quality - RATING 값 중 하나
 */
export function scheduleNext(prev = {}, quality) {
  let repetition = prev.repetition ?? 0;
  let easeFactor = prev.easeFactor ?? 2.5;
  let interval = prev.interval ?? 0;

  if (quality < 3) {
    // "다시" - 처음부터 다시 학습
    repetition = 0;
    interval = 0; // 같은 세션 내 재출제 (분 단위 취급)
  } else {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition += 1;
  }

  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const now = Date.now();
  const nextReview =
    quality < 3
      ? new Date(now + 10 * 60 * 1000).toISOString() // 10분 뒤 재출제
      : new Date(now + interval * DAY_MS).toISOString();

  return {
    repetition,
    easeFactor: Number(easeFactor.toFixed(2)),
    interval,
    nextReview,
    lastReviewed: new Date(now).toISOString(),
  };
}

/** 학습 상태 라벨 계산 (UI 배지용) */
export function getStatus(srsData) {
  if (!srsData || srsData.repetition === undefined) return 'new';
  if (srsData.repetition >= 5 && srsData.interval >= 21) return 'mastered';
  if (new Date(srsData.nextReview) <= new Date()) return 'due';
  return 'learning';
}

/** 오늘 복습해야 할 단어인지 판단 */
export function isDue(srsData) {
  if (!srsData || !srsData.nextReview) return true; // 아직 학습 안 한 새 단어
  return new Date(srsData.nextReview) <= new Date();
}
