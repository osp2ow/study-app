const STATUS_LABEL = {
  new: '新規',
  learning: '学習中',
  due: '復習必要',
  mastered: '習熟済み',
};

export default function GrammarList({ items }) {
  if (items.length === 0) {
    return <div className="empty-state">まだ文法がありません。</div>;
  }

  return (
    <div>
      {items.map((i) => (
        <div className="word-row" key={i.id}>
          <div className="info">
            <div className="jp">{i.pattern}</div>
            <div className="kr">{i.titleJp}</div>
          </div>
          <span className={`status-badge status-${i.status}`}>{STATUS_LABEL[i.status]}</span>
        </div>
      ))}
    </div>
  );
}
