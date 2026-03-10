import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";

export interface ScanlinesProps {
  className?: string;
  opacity?: number;
  spacing?: number;
}

export function Scanlines({
  className,
  opacity = 0.05,
  spacing = 2,
}: ScanlinesProps) {
  const { scanlines } = useEva();

  if (!scanlines) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 z-50", className)}
      style={{
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent ${spacing}px,
          rgba(0, 0, 0, ${opacity}) ${spacing}px,
          rgba(0, 0, 0, ${opacity}) ${spacing * 2}px
        )`,
      }}
      aria-hidden="true"
    />
  );
}
