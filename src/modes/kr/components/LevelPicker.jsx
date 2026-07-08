const LEVELS = ['1급', '2급', '3급', '4급', '5급', '6급'];

export default function LevelPicker({ levelCounts, onSelect }) {
  return (
    <div>
      <div className="empty-state" style={{ padding: '4px 4px 18px' }}>学習する級を選んでください。</div>
      <div className="level-picker">
        {LEVELS.map((lv) => {
          const count = levelCounts[lv] || 0;
          return (
            <button
              key={lv}
              className="level-btn"
              disabled={count === 0}
              onClick={() => onSelect(lv)}
            >
              <span className="level-btn-label mono">{lv}</span>
              <span className="level-btn-count">{count > 0 ? `${count}個` : '準備中'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
