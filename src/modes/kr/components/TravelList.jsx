const SCENES = ['全体', '空港', '食堂', '宿泊先', '道案内', 'ショッピング', '病院', '公共交通', '緊急事態'];
const STATUS_LABEL = {
  new: '新規',
  learning: '学習中',
  due: '復習必要',
  mastered: '習熟済み',
};

import { useState, useMemo } from 'react';

export default function TravelList({ items }) {
  const [scene, setScene] = useState('全体');

  const filtered = useMemo(() => {
    if (scene === '全体') return items;
    return items.filter((i) => i.scene === scene);
  }, [items, scene]);

  return (
    <div>
      <div className="level-tabs">
        {SCENES.map((s) => (
          <button key={s} className={scene === s ? 'active' : ''} onClick={() => setScene(s)}>
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">この場面の会話がまだありません。</div>
      ) : (
        <div>
          {filtered.map((i) => (
            <div className="word-row" key={i.id}>
              <div className="info">
                <div className="jp">{i.korean}</div>
                <div className="kr">{i.japanese}</div>
              </div>
              <span className={`status-badge status-${i.status}`}>{STATUS_LABEL[i.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
