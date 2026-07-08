const DECK_LABEL = { words: '단어', grammar: '문법', kanji: '한자', travel: '회화' };
const STATUS_LABEL = {
  new: '신규',
  learning: '학습중',
  due: '복습필요',
  mastered: '숙련',
};

function primaryText(item) {
  if (item.sourceDeck === 'words') return item.word;
  if (item.sourceDeck === 'grammar') return item.pattern;
  if (item.sourceDeck === 'kanji') return item.char;
  return item.japanese; // travel
}

function secondaryText(item) {
  if (item.sourceDeck === 'words') return item.meaning;
  if (item.sourceDeck === 'grammar') return item.title;
  if (item.sourceDeck === 'kanji') return `${item.meaning} · 한국음 ${item.koreanSound}`;
  return item.korean; // travel
}

export default function BookmarkList({ items, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        복습노트가 비어 있습니다.
        <br />
        학습 중 "☆ 복습에 추가" 버튼을 누르면 여기에 모입니다.
      </div>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <div className="word-row" key={`${item.sourceDeck}-${item.id}`}>
          <div className="info">
            <div className="jp">
              {primaryText(item)}{' '}
              <span className="deck-tag">{DECK_LABEL[item.sourceDeck]}</span>
            </div>
            <div className="kr">{secondaryText(item)}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className={`status-badge status-${item.status}`}>{STATUS_LABEL[item.status]}</span>
            <button className="remove-btn" onClick={() => onRemove(item)}>
              제거
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
