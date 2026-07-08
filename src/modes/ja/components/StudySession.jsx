import { useState, useMemo } from 'react';
import QuizCard from './QuizCard';
import { RATING } from '../../../lib/srs';

export default function StudySession({ dueItems, pool, submitReview, onToggleBookmark, onFinish }) {
  const [queue, setQueue] = useState(dueItems);
  const [doneCount, setDoneCount] = useState(0);
  const totalCount = useMemo(() => dueItems.length, [dueItems]);

  if (queue.length === 0) {
    return (
      <div className="empty-state">
        <p>오늘 학습할 항목이 없습니다 🎉</p>
        <button className="primary-btn" onClick={onFinish}>
          목록으로
        </button>
      </div>
    );
  }

  const current = queue[0];

  function handleResult(itemId, quality, sourceDeck) {
    submitReview(itemId, quality, sourceDeck);
    setQueue((prev) => {
      const rest = prev.slice(1);
      // 틀리면 큐 맨 뒤로 다시 배치 (같은 세션에서 재출제)
      if (quality < RATING.HARD) {
        return [...rest, prev[0]];
      }
      return rest;
    });
    if (quality >= RATING.HARD) {
      setDoneCount((d) => d + 1);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 14, fontSize: 12, color: 'var(--ink-soft)' }} className="mono">
        {doneCount} / {totalCount}
      </div>
      <QuizCard
        key={current.id + current.sourceDeck}
        item={current}
        pool={pool}
        onResult={handleResult}
        onToggleBookmark={onToggleBookmark}
      />
    </div>
  );
}
