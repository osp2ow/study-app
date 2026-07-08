const STATUS_LABEL = {
  new: '新規',
  learning: '学習中',
  due: '復習必要',
  mastered: '習熟済み',
};

export default function WordList({ items }) {
  if (items.length === 0) {
    return <div className="empty-state">まだ単語がありません。</div>;
  }

  return (
    <div>
      {items.map((w) => (
        <div className="word-row" key={w.id}>
          <div className="info">
            <div className="jp">{w.word}</div>
            <div className="kr">{w.meaningJp}</div>
          </div>
          <span className={`status-badge status-${w.status}`}>{STATUS_LABEL[w.status]}</span>
        </div>
      ))}
    </div>
  );
}
