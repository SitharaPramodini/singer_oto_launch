import { useState } from "react";
import CurtainReveal from "@/components/CurtainReveal";
import CurtainHeader from "@/components/CurtainHeader";
import Confetti from "@/components/Confetti";
import logo from "@/assets/app-logo-white.png";
import { cn } from "@/lib/utils";

export default function App() {
  const [celebrate, setCelebrate] = useState(false);

  // Everything lands together with the confetti, once the stage is clear.
  const entrance = (delayMs) => ({
    className: cn(
      "transition-all ease-[cubic-bezier(0.16,1,0.3,1)]",
      celebrate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
    ),
    style: { transitionDuration: "1100ms", transitionDelay: `${delayMs}ms` },
  });

  return (
    <>
      {/* Sits above the curtain panels, so they part underneath it. */}
      <CurtainHeader />

      <Confetti active={celebrate} />

      <CurtainReveal onRevealed={() => setCelebrate(true)}>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-[var(--valance-h)] text-center">
          <p
            {...entrance(0)}
            className={cn(
              entrance(0).className,
              "text-xs tracking-[0.5em] text-[var(--gold)] uppercase drop-shadow-[0_0_18px_rgba(212,175,55,0.5)] sm:text-sm",
            )}
          >
            Grand Launch
          </p>

          <div className="relative mt-10 flex items-center justify-center">
            {/* Stage glow behind the mark. */}
            <div
              aria-hidden="true"
              className={cn(
                "absolute -inset-x-12 -inset-y-20 rounded-full bg-[var(--oto-violet-700)]/30 blur-3xl transition-all duration-[1600ms] ease-out",
                celebrate ? "scale-100 opacity-100" : "scale-75 opacity-0",
              )}
              style={{ transitionDelay: "200ms" }}
            />
            <img
              src={logo}
              alt="OTO"
              className={cn(
                "relative w-[min(74vw,540px)]",
                "transition-all ease-[cubic-bezier(0.16,1,0.3,1)]",
                celebrate ? "scale-100 opacity-100" : "scale-90 opacity-0",
              )}
              style={{
                transitionDuration: "1400ms",
                transitionDelay: "150ms",
                // One filter, not two utilities: twMerge would drop the first.
                filter:
                  "drop-shadow(0 0 45px rgba(163, 38, 255, 0.45)) drop-shadow(0 0 90px rgba(212, 175, 55, 0.3))",
              }}
            />
          </div>

          <div
            aria-hidden="true"
            {...entrance(500)}
            className={cn(
              entrance(500).className,
              "mt-10 h-px w-56 bg-gradient-to-r from-transparent via-[var(--gold)] to-transparent shadow-[0_0_12px_rgba(255,215,110,0.6)]",
            )}
          />
        </main>
      </CurtainReveal>
    </>
  );
}
