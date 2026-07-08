import { useEffect, useState } from 'react';
import { subscribeToAuth, signInWithGoogle, signOutUser } from './firebase';
import JaStudyApp from './modes/ja/JaStudyApp';
import KrStudyApp from './modes/kr/KrStudyApp';

const MODE_META = {
  ja: { title: '日本語学習', subtitle: '단어 · 문법 · 한자 · 회화' },
  kr: { title: '韓国語学習', subtitle: '単語・文法・会話' },
};

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = 로딩중/読み込み中, null = 로그아웃 상태
  const [mode, setMode] = useState('ja'); // ja: 일본어 배우기(한국어 UI) | kr: 한국어 배우기(일본어 UI)

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

  const meta = MODE_META[mode];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="jp-text">{meta.title}</h1>
          <div className="subtitle">{meta.subtitle}</div>
        </div>
        {user && (
          <button
            onClick={signOutUser}
            style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer' }}
          >
            {mode === 'ja' ? '로그아웃' : 'ログアウト'}
          </button>
        )}
      </header>

      {/* 어떤 언어를 배우는 중인지 전환하는 토글. 두 언어 이름 자체를 라벨로 써서
          현재 UI 언어와 상관없이 누구나 바로 이해할 수 있게 함 */}
      <div className="deck-switch" style={{ marginBottom: 18 }}>
        <button className={mode === 'ja' ? 'active' : ''} onClick={() => setMode('ja')}>
          日本語
        </button>
        <button className={mode === 'kr' ? 'active' : ''} onClick={() => setMode('kr')}>
          한국어
        </button>
      </div>

      {user === undefined ? (
        <div className="empty-state">{mode === 'ja' ? '불러오는 중...' : '読み込み中...'}</div>
      ) : user === null ? (
        <div className="login-box">
          <p>
            {mode === 'ja' ? (
              <>
                PC와 모바일에서 학습 진도를 이어보려면
                <br />
                구글 계정으로 로그인하세요.
              </>
            ) : (
              <>
                パソコンとスマートフォンで学習の進み具合を引き継ぐには、
                <br />
                Googleアカウントでログインしてください。
              </>
            )}
          </p>
          <button className="primary-btn" onClick={signInWithGoogle}>
            {mode === 'ja' ? 'Google로 로그인' : 'Googleでログイン'}
          </button>
        </div>
      ) : mode === 'ja' ? (
        <JaStudyApp user={user} />
      ) : (
        <KrStudyApp user={user} />
      )}
    </div>
  );
}
