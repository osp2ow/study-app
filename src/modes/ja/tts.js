// 브라우저 내장 음성합성(Web Speech API)을 이용한 일본어 읽기.
// 여성 목소리를 우선 선택하고, 밝고 또렷하게 들리도록 rate/pitch를 조정한다.

let cachedVoice = null;

const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'kyoko', // macOS 일본어 여성 음성
  'haruka', // Windows 일본어 여성 음성
  'nanami', // Edge 신경망(Neural) 일본어 여성 음성 - 가장 밝고 또렷함
  'sayaka',
  'ayumi',
  'o-ren',
];

const MALE_VOICE_HINTS = ['male', 'otoya', 'ichiro', 'keita'];

function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const japaneseVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('ja'));
  const pool = japaneseVoices.length > 0 ? japaneseVoices : voices;

  const female = pool.find((v) =>
    FEMALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint))
  );
  const notMale = pool.find(
    (v) => !MALE_VOICE_HINTS.some((hint) => v.name.toLowerCase().includes(hint))
  );

  cachedVoice = female || notMale || pool[0] || null;
  return cachedVoice;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  // 음성 목록은 비동기로 로드되는 경우가 많아 미리 한 번 준비해둔다.
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

/**
 * 일본어 텍스트를 읽어준다. 가능하면 히라가나/가타카나로 된 요미가나(reading) 텍스트를
 * 넘기는 것이 한자 오독을 줄이는 데 유리하다.
 */
export function speakJapanese(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = 1.08; // 또렷하고 경쾌하게 들리도록 약간 빠르게
  utter.pitch = 1.15; // 밝은 톤

  const voice = cachedVoice || pickVoice();
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

export function cancelSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
