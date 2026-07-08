// 브라우저 내장 음성합성(Web Speech API)을 이용한 한국어 읽기.
// 여성 목소리를 우선 선택하고, 밝고 또렷하게 들리도록 rate/pitch를 조정한다.

let cachedVoice = null;

const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'yuna', // macOS/iOS 한국어 여성 음성
  'heami', // Windows 한국어 여성 음성
  'sunhi', // Edge 신경망(Neural) 한국어 여성 음성 - 가장 밝고 또렷함
  'jiyoung',
  'seoyeon',
];

const MALE_VOICE_HINTS = ['male', 'injoon', 'jinho', 'yong'];

function pickVoice() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const koreanVoices = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('ko'));
  const pool = koreanVoices.length > 0 ? koreanVoices : voices;

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
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

/** 한국어 텍스트를 읽어준다. (한글은 표기 자체가 발음 정보를 담고 있어 원문을 그대로 사용) */
export function speakKorean(text) {
  if (!text || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ko-KR';
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
