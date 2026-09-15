import { useCallback, useEffect, useRef, useState } from "react";
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

  // Curtains are away: hand the stage over. Driven by the panel's own
  // transitionend, with a timer as a safety net if that never fires.
  const finish = useCallback(() => {
    setPhase((p) => (p === "opening" ? "done" : p));
  }, []);

  useEffect(() => {
    if (phase !== "opening") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(finish, reduce ? 0 : duration + 600);
    return () => clearTimeout(t);
  }, [phase, duration, finish]);

  useEffect(() => {
    if (phase !== "done") return;
    onRevealedRef.current?.();
  }, [phase]);

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
    "absolute inset-y-0 w-[calc(50%+1px)] will-change-transform transition-transform ease-[cubic-bezier(0.72,0.02,0.22,1)]";
  // Each panel covers 50vw closed; stop short so --curtain-side stays on
  // screen. Driving it off the token keeps the drape and the stage padding
  // in step from one place.
  const travel = "calc(50vw - var(--curtain-side))";
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
            "transition-opacity duration-1000 ease-out",
            open ? "opacity-100" : "opacity-0",
          ],
          className,
        )}
        style={finished ? undefined : { transitionDelay: open ? "250ms" : "0ms" }}
      >
        {children}
      </div>

      <div className={cn("fixed inset-0 z-[100] overflow-hidden", open && "pointer-events-none")}>
        <div aria-hidden="true" className="absolute inset-0">
          {/* Left panel */}
          <div
            className={cn(panelBase, "left-0")}
            onTransitionEnd={(e) => {
              if (e.propertyName === "transform") finish();
            }}
            style={{
              ...panelStyle,
              backgroundPosition: "left center",
              transform: open ? `translateX(calc(-1 * ${travel}))` : "translateX(0)",
            }}
          >
            <div
              className="absolute inset-y-0 right-0 w-24"
              style={{
                backgroundImage:
                  "linear-gradient(to left, rgba(0,0,0,0.45), rgba(0,0,0,0.15) 50%, rgba(0,0,0,0))",
              }}
            />
          </div>

          {/* Right panel */}
          <div
            className={cn(panelBase, "right-0")}
            style={{
              ...panelStyle,
              backgroundPosition: "right center",
              transform: open ? `translateX(${travel})` : "translateX(0)",
            }}
          >
            <div
              className="absolute inset-y-0 left-0 w-24"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.45), rgba(0,0,0,0.15) 50%, rgba(0,0,0,0))",
              }}
            />
          </div>
        </div>

        {/* Start prompt and countdown, centred on the closed curtain */}
        <div className="absolute inset-0 flex items-center justify-center px-6">
          {phase === "waiting" && (
            <button
              type="button"
              onClick={() => setPhase("counting")}
              className="rounded-full border border-[var(--silver-hi)] px-9 py-3.5 font-[family-name:var(--font-poppins)] text-xs font-medium tracking-[0.2em] text-[var(--silver-hi)] uppercase transition-colors duration-300 ease-out hover:bg-[rgba(255,255,255,0.12)] focus-visible:ring-2 focus-visible:ring-[var(--silver-hi)] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent focus-visible:outline-none sm:px-11 sm:py-4 sm:text-sm"
            >
              Let&rsquo;s Go Live
            </button>
          )}

          {phase === "counting" && count > 0 && (
            <div
              key={count}
              role="status"
              aria-live="assertive"
              className="countdown-number font-[family-name:var(--font-poppins)] text-[clamp(6rem,26vw,18rem)] leading-none font-semibold"
              style={{ "--count-dur": `${countInterval}ms` }}
            >
              {count}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
