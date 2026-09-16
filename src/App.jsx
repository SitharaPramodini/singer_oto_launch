import { useEffect, useState } from "react";
import CurtainReveal from "@/components/CurtainReveal";
import CurtainHeader from "@/components/CurtainHeader";
import IntroVideo from "@/components/IntroVideo";
import { cn } from "@/lib/utils";
import { stopCountdown, stopTropical, swellTropical } from "@/lib/audio";

// How long the launch title holds before it bows out.
const TITLE_HOLD_MS = 2800;
// Matches the launch-exit keyframes in styles.css.
const TITLE_EXIT_MS = 900;

export default function App() {
  // curtain -> title -> exiting -> video
  const [stage, setStage] = useState("curtain");

  useEffect(() => {
    if (stage === "title") {
      const t = setTimeout(() => setStage("exiting"), TITLE_HOLD_MS);
      return () => clearTimeout(t);
    }
    if (stage === "video") {
      // Hand the soundstage over to the intro.
      stopTropical();
      return;
    }
    if (stage === "exiting") {
      const t = setTimeout(() => setStage("video"), TITLE_EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const leaving = stage === "exiting" || stage === "video";

  return (
    <>
      {/* Sits above the curtain panels, so they part underneath it.
          Lifts away once the intro takes over. */}
      <CurtainHeader show={stage !== "video"} />

      <CurtainReveal
        onOpen={() => {
          // Countdown track is done; let the music come back up.
          stopCountdown();
          swellTropical();
        }}
        onRevealed={() => setStage("title")}
      >
        <main className="flex min-h-screen flex-col items-center justify-center px-[calc(var(--curtain-side)+1.5rem)] pt-[var(--valance-h)] text-center">
          <h1
            className={cn(
              "launch-title font-[family-name:var(--font-serif)] text-[clamp(1.75rem,5.5vw,4rem)] leading-tight font-semibold tracking-[0.18em] uppercase",
              leaving && "is-leaving",
            )}
          >
            Official Launch
          </h1>
          <div
            className={cn(
              "mx-auto mt-10 h-px w-40 origin-center bg-[var(--gold-metal)] transition-transform duration-700 ease-out",
              leaving ? "scale-x-0" : "scale-x-100",
            )}
          />
        </main>
      </CurtainReveal>

      <IntroVideo active={stage === "video"} />
    </>
  );
}
