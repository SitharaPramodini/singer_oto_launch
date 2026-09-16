import { useEffect, useState } from "react";
import qrSrc from "@/assets/QR.png";
import { cn } from "@/lib/utils";

/**
 * Closing slide. Shown on white and fully contained — a cropped or tinted
 * QR code stops scanning, so this one never fills by cropping.
 */
export default function QrScreen({ active }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!active) return;
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[150] bg-white transition-opacity duration-700",
        shown ? "opacity-100" : "opacity-0",
      )}
    >
      <img
        src={qrSrc}
        alt="Download OTO by Singer Finance — App Store and Google Play QR codes"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
