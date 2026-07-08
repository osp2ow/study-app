const STATUS_LABEL = {
  new: '신규',
  learning: '학습중',
  due: '복습필요',
  mastered: '숙련',
};

export default function GrammarList({ items }) {
  if (items.length === 0) {
    return <div className="empty-state">아직 문법이 없습니다.</div>;
  }

  return (
    <div>
      {items.map((i) => (
        <div className="word-row" key={i.id}>
          <div className="info">
            <div className="jp">{i.pattern}</div>
            <div className="kr">{i.title}</div>
          </div>
          <span className={`status-badge status-${i.status}`}>{STATUS_LABEL[i.status]}</span>
        </div>
      ))}
    </div>
  );
}
