const DECK_LABEL = { words: '単語', grammar: '文法', travel: '会話' };
const STATUS_LABEL = {
  new: '新規',
  learning: '学習中',
  due: '復習必要',
  mastered: '習熟済み',
};

function primaryText(item) {
  if (item.sourceDeck === 'words') return item.word;
  if (item.sourceDeck === 'grammar') return item.pattern;
  return item.korean; // travel
}

function secondaryText(item) {
  if (item.sourceDeck === 'words') return item.meaningJp;
  if (item.sourceDeck === 'grammar') return item.titleJp;
  return item.japanese; // travel
}

export default function BookmarkList({ items, onRemove }) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        復習ノートが空です。
        <br />
        学習中に「☆ 復習に追加」ボタンを押すとここに集まります。
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
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
