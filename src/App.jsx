import { useEffect, useState } from 'react';
import { subscribeToAuth, signUpWithEmail, signInWithEmail, signOutUser } from './firebase';
import JaStudyApp from './modes/ja/JaStudyApp';
import KrStudyApp from './modes/kr/KrStudyApp';

const MODE_META = {
  ja: { title: '日本語学習', subtitle: '단어 · 문법 · 한자 · 회화' },
  kr: { title: '韓国語学習', subtitle: '単語・文法・会話' },
};

const ERROR_MESSAGES = {
  ja: {
    'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인을 눌러주세요.',
    'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
    'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
    'auth/user-not-found': '가입되지 않은 이메일입니다. 회원가입을 눌러주세요.',
    'auth/wrong-password': '비밀번호가 틀렸습니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    default: '오류가 발생했습니다. 다시 시도해주세요.',
  },
  kr: {
    'auth/email-already-in-use': 'すでに登録済みのメールアドレスです。ログインを押してください。',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
    'auth/weak-password': 'パスワードは6文字以上にしてください。',
    'auth/user-not-found': '登録されていないメールアドレスです。新規登録を押してください。',
    'auth/wrong-password': 'パスワードが間違っています。',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません。',
    default: 'エラーが発生しました。もう一度お試しください。',
  },
};

function LoginForm({ mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function getMessage(code) {
    const table = ERROR_MESSAGES[mode];
    return table[code] || table.default;
  }

  async function handleSignIn() {
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (e) {
      setError(getMessage(e.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setError('');
    setLoading(true);
    try {
      await signUpWithEmail(email, password);
    } catch (e) {
      setError(getMessage(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-box">
      <p>
        {mode === 'ja' ? (
          <>
            PC와 모바일에서 학습 진도를 이어보려면
            <br />
            이메일로 로그인하세요.
          </>
        ) : (
          <>
            パソコンとスマートフォンで学習の進み具合を引き継ぐには、
            <br />
            メールアドレスでログインしてください。
          </>
        )}
      </p>

      <input
        type="email"
        className="login-input"
        placeholder={mode === 'ja' ? '이메일' : 'メールアドレス'}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        className="login-input"
        placeholder={mode === 'ja' ? '비밀번호 (6자 이상)' : 'パスワード（6文字以上）'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <div className="login-error">{error}</div>}

      <div className="action-row">
        <button className="secondary-btn" onClick={handleSignUp} disabled={loading}>
          {mode === 'ja' ? '회원가입' : '新規登録'}
        </button>
        <button className="primary-btn" onClick={handleSignIn} disabled={loading}>
          {mode === 'ja' ? '로그인' : 'ログイン'}
        </button>
      </div>
    </div>
  );
}

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
        <LoginForm mode={mode} />
      ) : mode === 'ja' ? (
        <JaStudyApp user={user} />
      ) : (
        <KrStudyApp user={user} />
      )}
    </div>
  );
}
