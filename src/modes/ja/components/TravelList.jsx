import { useState, useMemo } from 'react';

const SCENES = ['전체', '공항', '식당', '숙소', '길찾기', '쇼핑', '병원', '대중교통', '긴급상황', '비즈니스'];
const STATUS_LABEL = {
  new: '신규',
  learning: '학습중',
  due: '복습필요',
  mastered: '숙련',
};

export default function TravelList({ items }) {
  const [scene, setScene] = useState('전체');

  const filtered = useMemo(() => {
    if (scene === '전체') return items;
    return items.filter((i) => i.scene === scene);
  }, [items, scene]);

  return (
    <div>
      <div className="level-tabs">
        {SCENES.map((s) => (
          <button
            key={s}
            className={scene === s ? 'active' : ''}
            onClick={() => setScene(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">해당 장면의 회화가 아직 없습니다.</div>
      ) : (
        <div>
          {filtered.map((i) => (
            <div className="word-row" key={i.id}>
              <div className="info">
                <div className="jp">{i.japanese}</div>
                <div className="kr">{i.korean}</div>
              </div>
              <span className={`status-badge status-${i.status}`}>
                {STATUS_LABEL[i.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
