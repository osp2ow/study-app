import { useEffect, useMemo, useState } from 'react';
import { RATING } from '../../../lib/srs';
import { buildOptions } from '../../../lib/quiz';
import { ANSWER_GETTERS } from '../deckConfig';
import { speakJapanese, cancelSpeech } from '../tts';
import { playCorrectSound, playWrongSound } from '../../../lib/sound';

// 예문/보기를 읽어줄 때는 한자 오독을 피하기 위해 히라가나/가타카나 요미가나를 사용한다.
function getSpeechText(deckType, item) {
  if (deckType === 'words') return item.exampleReading || item.example;
  if (deckType === 'grammar') return item.exampleReading || item.example;
  if (deckType === 'travel') return item.reading || item.japanese;
  if (deckType === 'kanji') return item.examples?.[0]?.reading || item.char;
  return null;
}

function splitChars(text) {
  return Array.from(text || '');
}

function renderQuestion(deckType, item) {
  if (deckType === 'words') {
    return (
      <>
        <div className="genkou-row">
          {splitChars(item.word).map((ch, i) => (
            <div className="genkou-cell" key={i}>
              <span className="char jp-text">{ch}</span>
            </div>
          ))}
        </div>
        <div className="reading">{item.reading}</div>
      </>
    );
  }
  if (deckType === 'kanji') {
    return (
      <div className="genkou-square">
        <span className="char">{item.char}</span>
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
      <div className="pattern jp-text" style={{ fontSize: 19 }}>{item.japanese}</div>
      <div className="meaning-hint">{item.reading}</div>
    </div>
  );
}

function renderDetail(deckType, item) {
  if (deckType === 'words') {
    return (
      <div className="example">
        {item.example}
        <br />({item.exampleReading})<br />
        {item.exampleMeaning}
      </div>
    );
  }
  if (deckType === 'grammar') {
    return (
      <>
        <div className="connection-note">
          <strong>접속</strong> · {item.connection}
        </div>
        <div className="example">
          {item.example}
          <br />({item.exampleReading})<br />
          {item.exampleMeaning}
        </div>
        <div className="korean-contrast">
          <strong>한국인 학습자 노트</strong>
          <br />
          {item.koreanNote}
        </div>
      </>
    );
  }
  if (deckType === 'kanji') {
    return (
      <>
        <div className="reading">
          음독 {item.onyomi} · 훈독 {item.kunyomi}
        </div>
        <div className="korean-contrast">
          <strong>한국 한자음: {item.koreanSound}</strong>
          <br />
          {item.note}
        </div>
        <div className="example" style={{ textAlign: 'left' }}>
          {item.examples.map((ex, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <span className="jp-text">{ex.word}</span> ({ex.reading}) — {ex.meaning}
            </div>
          ))}
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

  // 카드가 바뀌거나(다음 문제) 언마운트되면 재생 중인 음성을 정리
  useEffect(() => cancelSpeech, []);

  // 여행회화는 문제(문장) 자체를 듣고 뜻을 맞히는 방식이므로, 문제가 나오면 살짝 텀을 두고 읽어줌
  useEffect(() => {
    if (deckType === 'travel' && speechText) {
      const timer = setTimeout(() => speakJapanese(speechText), 500);
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

    // 효과음이 먼저 들리도록 살짝 텀을 두고 바로 이어서 읽어줌
    if (speechText) {
      setTimeout(() => speakJapanese(speechText), 500);
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
              {isCorrect ? '정답입니다!' : `오답입니다. 정답: ${correctText}`}
            </div>

            {renderDetail(deckType, item)}

            {speechText && (
              <button className="replay-btn" onClick={() => speakJapanese(speechText)}>
                🔊 다시 듣기
              </button>
            )}

            <div className="action-row">
              <button
                className={`secondary-btn ${bookmarked ? 'active' : ''}`}
                onClick={handleToggleBookmark}
              >
                {bookmarked ? '★ 복습노트에 있음' : '☆ 복습에 추가'}
              </button>
              <button className="primary-btn" onClick={handleNext}>
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
