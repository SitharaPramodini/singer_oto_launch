let ctx = null;

/**
 * Must be called from a user gesture (the Go Live click), otherwise the
 * browser keeps the context suspended and nothing is audible.
 */
export function primeAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

/** Short synthesised blip — no audio file needed. */
export function playTick({ frequency = 760, duration = 0.18, volume = 0.16 } = {}) {
  const audio = primeAudio();
  if (!audio) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(frequency, now);

  // Quick attack, exponential decay: a clean tick rather than a beep.
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}
