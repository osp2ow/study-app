// Web Audio API로 짧은 효과음을 직접 합성한다. 외부 오디오 파일이 필요 없다.

let sharedCtx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx) sharedCtx = new AudioCtx();
  if (sharedCtx.state === 'suspended') sharedCtx.resume();
  return sharedCtx;
}

function playNote(ctx, freq, startTime, duration, type, volume) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

// 밝게 올라가는 2음 차임 (정답)
export function playCorrectSound() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(ctx, 880, now, 0.11, 'sine', 0.22); // A5
  playNote(ctx, 1318.51, now + 0.1, 0.16, 'sine', 0.22); // E6
}

// 낮게 내려가는 2음 (오답)
export function playWrongSound() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(ctx, 300, now, 0.15, 'sawtooth', 0.14);
  playNote(ctx, 175, now + 0.13, 0.2, 'sawtooth', 0.14);
}
