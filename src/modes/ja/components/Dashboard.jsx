export default function Dashboard({ stats, onStartStudy, emptyMessage }) {
  if (stats.total === 0) {
    return (
      <div className="empty-state">
        {emptyMessage || (
          <>
            이 급수의 콘텐츠가 아직 준비되지 않았습니다.
            <br />
            다른 급수를 선택해주세요.
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-box">
          <div className="num">{stats.total}</div>
          <div className="label">전체</div>
        </div>
        <div className="stat-box">
          <div className="num">{stats.due}</div>
          <div className="label">오늘 학습</div>
        </div>
        <div className="stat-box">
          <div className="num">{stats.mastered}</div>
          <div className="label">숙련</div>
        </div>
      </div>

      <button className="primary-btn" disabled={stats.due === 0} onClick={onStartStudy}>
        {stats.due > 0 ? `학습 시작 (${stats.due}개)` : '오늘 학습 완료'}
      </button>
    </div>
  );
}
