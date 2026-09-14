import { useEffect, useRef, useState } from "react";

const COLORS = [
  // Brand violets
  "#a326ff",
  "#c685ff",
  "#d2b7de",
  "#7000c3",
  "#a570bd",
  "#9e0450",
  // Gold, for the grand-launch glint
  "#ffd76e",
  "#f7e7bd",
  "#d4af37",
  "#a8781c",
  "#ffd76e",
  "#d4af37",
];

const GRAVITY = 0.18;
const DRAG = 0.994;

function burst(particles, x, y, angle, count) {
  for (let i = 0; i < count; i++) {
    const spread = (Math.random() - 0.5) * 1.0;
    const speed = 11 + Math.random() * 13;
    particles.push({
      x,
      y,
      vx: Math.cos(angle + spread) * speed,
      vy: Math.sin(angle + spread) * speed,
      w: 6 + Math.random() * 7,
      h: 8 + Math.random() * 8,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      round: Math.random() < 0.25,
      life: 1,
      decay: 0.004 + Math.random() * 0.004,
    });
  }
}

/**
 * One-shot celebratory confetti. Flip `active` to true to fire it;
 * the canvas unmounts itself once every piece has settled.
 */
export default function Confetti({ active, count = 120, className }) {
  const canvasRef = useRef(null);
  const [spent, setSpent] = useState(false);

  useEffect(() => {
    if (!active || spent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSpent(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = [];
    const fire = () => {
      burst(particles, 0, height, -Math.PI / 3, count);
      burst(particles, width, height, (-Math.PI * 2) / 3, count);
    };
    fire();
    const waves = [
      setTimeout(() => {
        burst(particles, width / 2, height * 0.12, Math.PI / 2, Math.round(count * 0.7));
      }, 400),
      setTimeout(() => {
        burst(particles, width * 0.2, height, -Math.PI / 2.4, Math.round(count * 0.55));
        burst(particles, width * 0.8, height, -Math.PI / 1.72, Math.round(count * 0.55));
      }, 950),
    ];

    let frame;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += GRAVITY;
        p.vx *= DRAG;
        p.vy *= DRAG;
        p.wobble += 0.1;
        p.x += p.vx + Math.sin(p.wobble) * 0.7;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= p.decay;

        if (p.life <= 0 || p.y - p.h > height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // Catches the light as it tumbles: dim edge-on, bright face-on.
        const shimmer = 0.55 + 0.45 * Math.abs(Math.cos(p.wobble));
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6)) * shimmer;
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Squash the width to fake a piece of paper flipping edge-on.
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w * Math.abs(Math.cos(p.wobble)), p.h);
        }
        ctx.restore();
      }

      if (particles.length === 0) {
        setSpent(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      waves.forEach(clearTimeout);
      window.removeEventListener("resize", resize);
    };
  }, [active, spent, count]);

  if (!active || spent) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[120] h-full w-full ${className ?? ""}`}
    />
  );
}
