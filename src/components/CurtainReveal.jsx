import { useEffect, useRef, useState } from "react";
import curtainImg from "@/assets/curtain.png";
import { cn } from "@/lib/utils";

/**
 * Holds the stage closed until the visitor presses a key or taps, counts
 * them in, then parts the curtains.
 *
 * Phases: loading -> waiting -> counting -> opening -> done
 *
 * The panels are two halves of the same picture (background-size 200%),
 * so closed they read as one continuous drape.
 */
export default function CurtainReveal({
  children,
  duration = 2400,
  countFrom = 3,
  countInterval = 900,
  className,
  onOpen,
  onRevealed,
}) {
  const [phase, setPhase] = useState("loading");
  const [count, setCount] = useState(countFrom);

  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;
  const onRevealedRef = useRef(onRevealed);
  onRevealedRef.current = onRevealed;

  const open = phase === "opening" || phase === "done";
  const finished = phase === "done";

  // Don't offer to start before the fabric is actually there.
  useEffect(() => {
    let cancelled = false;
    const ready = () => !cancelled && setPhase("waiting");

    const img = new Image();
    img.src = curtainImg;
    if (img.complete) ready();
    else {
      img.onload = ready;
      img.onerror = ready;
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Any key, tap or click starts the count.
  useEffect(() => {
    if (phase !== "waiting") return;

    const begin = () => setPhase("counting");
    window.addEventListener("keydown", begin);
    window.addEventListener("pointerdown", begin);
    return () => {
      window.removeEventListener("keydown", begin);
      window.removeEventListener("pointerdown", begin);
    };
  }, [phase]);

  // 3... 2... 1...
  useEffect(() => {
    if (phase !== "counting") return;

    if (count <= 0) {
      setPhase("opening");
      onOpenRef.current?.();
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), countInterval);
    return () => clearTimeout(t);
  }, [phase, count, countInterval]);

  // Curtains are away: hand the stage over.
  useEffect(() => {
    if (phase !== "opening") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(
      () => {
        setPhase("done");
        onRevealedRef.current?.();
      },
      reduce ? 0 : duration + 200,
    );
    return () => clearTimeout(t);
  }, [phase, duration]);

  // Keep the page still while the curtain is closed.
  useEffect(() => {
    if (finished) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [finished]);

  const panelBase =
    "absolute inset-y-0 w-1/2 will-change-transform transition-transform ease-[cubic-bezier(0.72,0.02,0.22,1)]";
  const panelStyle = {
    backgroundImage: `url(${curtainImg})`,
    backgroundSize: "200% 100%",
    backgroundRepeat: "no-repeat",
    transitionDuration: `${duration}ms`,
  };

  return (
    <>
      <div
        className={cn(
          !finished && [
            "transition-all duration-[1400ms] ease-out",
            open ? "scale-100 opacity-100 blur-0" : "scale-[1.05] opacity-0 blur-[2px]",
          ],
          className,
        )}
        style={finished ? undefined : { transitionDelay: open ? "250ms" : "0ms" }}
      >
        {children}
      </div>

      {!finished && (
        <div className={cn("fixed inset-0 z-[100] overflow-hidden", open && "pointer-events-none")}>
          <div aria-hidden="true" className="absolute inset-0">
            {/* Left panel */}
            <div
              className={cn(panelBase, "left-0")}
              style={{
                ...panelStyle,
                backgroundPosition: "left center",
                transform: open ? "translateX(-101%)" : "translateX(0)",
              }}
            >
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/45 via-black/15 to-transparent" />
            </div>

            {/* Right panel */}
            <div
              className={cn(panelBase, "right-0")}
              style={{
                ...panelStyle,
                backgroundPosition: "right center",
                transform: open ? "translateX(101%)" : "translateX(0)",
              }}
            >
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/45 via-black/15 to-transparent" />
            </div>
          </div>

          {/* Start prompt and countdown, centred on the closed curtain */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            {phase === "waiting" && (
              <p className="curtain-hint text-center text-xs tracking-[0.4em] text-[var(--oto-violet-300)] uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] sm:text-sm">
                Press any key or tap to begin
              </p>
            )}

            {phase === "counting" && count > 0 && (
              <div
                key={count}
                role="status"
                aria-live="assertive"
                className="countdown-number bg-gradient-to-b from-[var(--oto-orchid-300)] to-[var(--oto-violet-300)] bg-clip-text font-[family-name:var(--font-serif)] text-[clamp(6rem,26vw,18rem)] leading-none font-semibold text-transparent drop-shadow-[0_0_70px_rgba(198,133,255,0.75)]"
                style={{ "--count-dur": `${countInterval}ms` }}
              >
                {count}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
