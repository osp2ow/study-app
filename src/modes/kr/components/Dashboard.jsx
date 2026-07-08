export default function Dashboard({ stats, onStartStudy, emptyMessage }) {
  if (stats.total === 0) {
    return (
      <div className="empty-state">
        {emptyMessage || (
          <>
            この級のコンテンツはまだ準備されていません。
            <br />
            他の級を選んでください。
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
          <div className="label">全体</div>
        </div>
        <div className="stat-box">
          <div className="num">{stats.due}</div>
          <div className="label">今日の学習</div>
        </div>
        <div className="stat-box">
          <div className="num">{stats.mastered}</div>
          <div className="label">習熟済み</div>
        </div>
      </div>

      <button className="primary-btn" disabled={stats.due === 0} onClick={onStartStudy}>
        {stats.due > 0 ? `学習開始 (${stats.due}個)` : '今日の学習は完了しました'}
      </button>
    </div>
  );
}
