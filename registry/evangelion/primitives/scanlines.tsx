import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";

export interface ScanlinesProps {
  className?: string;
  intensity?: "subtle" | "medium" | "heavy";
}

export function Scanlines({
  className,
  intensity = "medium",
}: ScanlinesProps) {
  const { scanlines } = useEva();

  if (!scanlines) return null;

  const opacityMap = { subtle: 0.04, medium: 0.08, heavy: 0.14 };
  const op = opacityMap[intensity];

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-50 overflow-hidden", className)}
      aria-hidden="true"
    >
      {/* horizontal scanlines */}
      <div
        className="absolute inset-0 animate-[eva-interlace-flicker_8s_ease-in-out_infinite]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(0,0,0,${op}) 1px,
            rgba(0,0,0,${op}) 2px
          )`,
        }}
      />
      {/* subtle chromatic aberration on edges */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(90deg,
              rgba(255,0,0,0.02) 0%,
              transparent 3%,
              transparent 97%,
              rgba(0,80,255,0.02) 100%
            )
          `,
        }}
      />
      {/* slight vignette -- CRT screen edges are darker */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)`,
        }}
      />
    </div>
  );
}
