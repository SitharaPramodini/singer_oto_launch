import countdownSrc from "@/assets/countdown.mp3";
import tropicalSrc from "@/assets/tropical.mp3";

const TROPICAL_FULL = 0.85;
const TROPICAL_DUCKED = 0.3;

// Once the intro takes over, the bed is done for good — nothing may
// restart it (a late gesture-fallback would otherwise play over the video).
let tropicalRetired = false;

const cache = new Map();
const ramps = new Map();

function get(src, loop) {
  let el = cache.get(src);
  if (!el) {
    el = new Audio(src);
    el.preload = "auto";
    el.loop = loop;
    cache.set(src, el);
  }
  return el;
}

/** Browsers block playback that isn't tied to a user gesture, so the first
 *  call has to come from the Go Live click. Later calls inherit that. */
function play(src, { loop = false, volume = 1 } = {}) {
  const el = get(src, loop);
  cancelAnimationFrame(ramps.get(src));
  el.volume = volume;
  el.currentTime = 0;
  return el.play().catch(() => {});
}

/** Volume ramp; `stopAtZero` pauses and rewinds once it lands. */
function ramp(src, to, ms, stopAtZero = false) {
  const el = cache.get(src);
  if (!el) return;

  cancelAnimationFrame(ramps.get(src));
  const from = el.volume;
  const start = performance.now();

  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    el.volume = from + (to - from) * t;
    if (t < 1) {
      ramps.set(src, requestAnimationFrame(step));
    } else if (stopAtZero) {
      el.pause();
      el.currentTime = 0;
    }
  };
  ramps.set(src, requestAnimationFrame(step));
}

export const playCountdown = () => play(countdownSrc);
export const stopCountdown = () => {
  const el = cache.get(countdownSrc);
  if (!el) return;
  el.pause();
  el.currentTime = 0;
};

/** Starts the bed, or leaves it running if it already is. */
export function playTropical() {
  if (tropicalRetired) return Promise.resolve();
  const el = get(tropicalSrc, true);
  cancelAnimationFrame(ramps.get(tropicalSrc));
  el.volume = TROPICAL_FULL;
  if (!el.paused) return Promise.resolve();
  return el.play();
}

/**
 * Try to start the music immediately. Browsers block audio that isn't tied
 * to a user gesture, so if that's refused we arm the first interaction —
 * a mouse move is enough — and start then.
 */
export function startTropicalAsap() {
  const EVENTS = ["pointerdown", "pointermove", "keydown", "touchstart", "wheel"];
  let armed = false;

  const disarm = () => {
    if (!armed) return;
    armed = false;
    EVENTS.forEach((e) => window.removeEventListener(e, onGesture));
  };

  const onGesture = () => {
    playTropical().then(disarm, () => {});
  };

  playTropical().catch(() => {
    armed = true;
    EVENTS.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
  });

  return disarm;
}

/** Pull the music back so the countdown reads clearly over it. */
export const duckTropical = () => ramp(tropicalSrc, TROPICAL_DUCKED, 500);
export const swellTropical = () => ramp(tropicalSrc, TROPICAL_FULL, 700);
export const stopTropical = () => {
  tropicalRetired = true;
  ramp(tropicalSrc, 0, 600, true);
};
