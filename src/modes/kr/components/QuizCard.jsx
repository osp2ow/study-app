import { useEffect, useMemo, useState } from 'react';
import { RATING } from '../../../lib/srs';
import { buildOptions } from '../../../lib/quiz';
import { ANSWER_GETTERS } from '../deckConfig';
import { speakKorean, cancelSpeech } from '../tts';
import { playCorrectSound, playWrongSound } from '../../../lib/sound';

// 発音/読み上げ対象のテキストは韓国語(学習対象言語)そのものを使う。
// ハングルは表記自体が発音情報を含むため、日本語の漢字のような読み替えは不要。
function getSpeechText(deckType, item) {
  if (deckType === 'words') return item.example || item.word;
  if (deckType === 'grammar') return item.example;
  if (deckType === 'travel') return item.korean;
  return null;
}

function splitChars(text) {
  return Array.from(text || '');
}

function renderQuestion(deckType, item) {
  if (deckType === 'words') {
    return (
      <div className="genkou-row">
        {splitChars(item.word).map((ch, i) => (
          <div className="genkou-cell" key={i}>
            <span className="char jp-text">{ch}</span>
          </div>
        ))}
      </div>
    );
  }
  if (deckType === 'grammar') {
    return (
      <div className="pattern-plate">
        <div className="pattern jp-text">{item.pattern}</div>
      </div>
    );
  }
  // travel
  return (
    <div className="pattern-plate">
      <div className="scene-tag">{item.scene}</div>
      <div className="pattern jp-text" style={{ fontSize: 19 }}>{item.korean}</div>
      <div className="meaning-hint">{item.pronunciation}</div>
    </div>
  );
}

function renderDetail(deckType, item) {
  if (deckType === 'words') {
    return (
      <div className="example">
        {item.example}
        <br />({item.examplePronunciation})<br />
        {item.exampleMeaningJp}
      </div>
    );
  }
  if (deckType === 'grammar') {
    return (
      <>
        <div className="connection-note">
          <strong>接続</strong> · {item.connection}
        </div>
        <div className="example">
          {item.example}
          <br />
          {item.exampleMeaningJp}
        </div>
        <div className="korean-contrast">
          <strong>日本語話者向けノート</strong>
          <br />
          {item.japaneseNote}
        </div>
      </>
    );
  }
  // travel
  return <div className="connection-note">{item.note}</div>;
}

export default function QuizCard({ item, pool, onResult, onToggleBookmark }) {
  const deckType = item.sourceDeck;
  const [selected, setSelected] = useState(null);
  const [bookmarked, setBookmarkedState] = useState(!!item.srs?.bookmarked);

  const getAnswer = ANSWER_GETTERS[deckType];
  const correctText = useMemo(() => getAnswer(item), [item, getAnswer]);
  const options = useMemo(() => buildOptions(item, pool, getAnswer, 4), [item, pool, getAnswer]);
  const speechText = useMemo(() => getSpeechText(deckType, item), [deckType, item]);

  const answered = selected !== null;
  const isCorrect = selected === correctText;

  // カードが変わる(次の問題)か、アンマウントされたら再生中の音声を止める
  useEffect(() => cancelSpeech, []);

  // 会話フレーズは文章自体を聞いて意味を当てる方式なので、問題が出たら少し間を置いて読み上げる
  useEffect(() => {
    if (deckType === 'travel' && speechText) {
      const timer = setTimeout(() => speakKorean(speechText), 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(opt) {
    if (answered) return;
    const correct = opt === correctText;
    setSelected(opt);

    if (correct) playCorrectSound();
    else playWrongSound();

    if (speechText) {
      setTimeout(() => speakKorean(speechText), 500);
    }
  }

  function handleNext() {
    onResult(item.id, isCorrect ? RATING.GOOD : RATING.AGAIN, item.sourceDeck);
  }

  function handleToggleBookmark() {
    const next = !bookmarked;
    setBookmarkedState(next);
    onToggleBookmark(item, next);
  }

  return (
    <div className="genkou-card">
      <span className="hanko">{item.level}</span>
      <div style={{ marginTop: 8 }}>
        {renderQuestion(deckType, item)}

        <div className="option-list">
          {options.map((opt) => {
            let cls = 'option-btn';
            if (answered) {
              if (opt === correctText) cls += ' option-correct';
              else if (opt === selected) cls += ' option-wrong';
            }
            return (
              <button key={opt} className={cls} onClick={() => handleSelect(opt)} disabled={answered}>
                {opt}
              </button>
            );
          })}
        </div>

        {answered && (
          <>
            <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
              {isCorrect ? '正解です!' : `不正解です。正解: ${correctText}`}
            </div>

            {renderDetail(deckType, item)}

            {speechText && (
              <button className="replay-btn" onClick={() => speakKorean(speechText)}>
                🔊 もう一度聞く
              </button>
            )}

            <div className="action-row">
              <button
                className={`secondary-btn ${bookmarked ? 'active' : ''}`}
                onClick={handleToggleBookmark}
              >
                {bookmarked ? '★ 復習ノートに追加済み' : '☆ 復習に追加'}
              </button>
              <button className="primary-btn" onClick={handleNext}>
                次へ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
