const STATUS_LABEL = {
  new: '신규',
  learning: '학습중',
  due: '복습필요',
  mastered: '숙련',
};

export default function WordList({ items }) {
  if (items.length === 0) {
    return <div className="empty-state">아직 단어가 없습니다.</div>;
  }

  return (
    <div>
      {items.map((w) => (
        <div className="word-row" key={w.id}>
          <div className="info">
            <div className="jp">
              {w.word} <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{w.reading}</span>
            </div>
            <div className="kr">{w.meaning}</div>
          </div>
          <span className={`status-badge status-${w.status}`}>{STATUS_LABEL[w.status]}</span>
        </div>
      ))}
    </div>
  );
}
