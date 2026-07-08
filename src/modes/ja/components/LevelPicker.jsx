const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function LevelPicker({ levelCounts, onSelect }) {
  return (
    <div>
      <div className="empty-state" style={{ padding: '4px 4px 18px' }}>학습할 급수를 선택하세요.</div>
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
              <span className="level-btn-count">{count > 0 ? `${count}개` : '준비중'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
