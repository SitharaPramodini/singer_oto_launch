import { useEffect, useRef, useState } from "react";
import introSrc from "@/assets/intro.mp4";
import { cn } from "@/lib/utils";

/**
 * Intro playback, framed by the standing curtains. No controls, and it holds on the final
 * frame when it finishes rather than going black.
 *
 * The element stays mounted from the start so the file buffers during
 * the curtain sequence instead of stalling when it's called for.
 */
export default function IntroVideo({ active, src = introSrc, onPlaying, onEnded }) {
  const videoRef = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) return;

    const video = videoRef.current;
    if (!video) return;

    // Fade in on the next frame so the handover isn't a hard cut.
    const raf = requestAnimationFrame(() => setShown(true));

    video.play().catch(() => {
      // Sound was refused despite the earlier click: run it muted
      // rather than not at all.
      video.muted = true;
      video.play().catch(() => {});
    });

    return () => cancelAnimationFrame(raf);
  }, [active]);

  // Fires when frames actually start rendering, not when we merely ask it
  // to play — with a large file those can be seconds apart.
  const handlePlaying = () => {
    onPlaying?.();
  };

  const handleEnded = () => {
    // Pausing leaves the last decoded frame on screen.
    videoRef.current?.pause();
    onEnded?.();
  };

  return (
    <div
      className={cn(
        // Full viewport as before, but stacked below the drapes and
        // valance so the curtain stays framing it.
        "fixed inset-0 z-[90] bg-black transition-opacity duration-700",
        active && shown ? "opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!active}
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        onPlaying={handlePlaying}
        onEnded={handleEnded}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
