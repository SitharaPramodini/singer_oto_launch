import headerImg from "@/assets/curtain-header.png";
import { cn } from "@/lib/utils";

/**
 * Scalloped valance pinned to the top of the viewport.
 * Height comes from --valance-h so page content can reserve the same space.
 */
export default function CurtainHeader({ children, show = true, className }) {
  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[110] select-none",
        "transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]",
        show ? "translate-y-0" : "-translate-y-full",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="h-[var(--valance-h)] w-full"
        style={{
          backgroundImage: `url(${headerImg})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          // A violet glow, not a shadow: black on black would be invisible.
          filter:
            "drop-shadow(0 8px 18px rgba(212, 175, 55, 0.45)) drop-shadow(0 2px 4px rgba(255, 215, 110, 0.6))",
        }}
      />
      {children && (
        <div className="pointer-events-auto absolute inset-x-0 top-0 flex h-[calc(var(--valance-h)*0.55)] items-center justify-center px-4">
          {children}
        </div>
      )}
    </header>
  );
}
