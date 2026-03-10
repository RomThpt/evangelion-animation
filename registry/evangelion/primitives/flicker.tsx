import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { useFlicker, type UseFlickerOptions } from "../hooks/use-flicker";

export interface FlickerProps extends UseFlickerOptions {
  children: ReactNode;
  className?: string;
  /**
   * "subtle" -- barely perceptible CRT warmth variation
   * "moderate" -- noticeable analog display instability
   * "heavy" -- damaged/unstable connection feel
   */
  intensity?: "subtle" | "moderate" | "heavy";
}

const presets: Record<string, UseFlickerOptions> = {
  subtle: { minOpacity: 0.92, maxOpacity: 1.0, minInterval: 100, maxInterval: 400 },
  moderate: { minOpacity: 0.78, maxOpacity: 1.0, minInterval: 40, maxInterval: 200 },
  heavy: { minOpacity: 0.5, maxOpacity: 1.0, minInterval: 20, maxInterval: 120 },
};

export function Flicker({
  children,
  className,
  intensity = "subtle",
  ...overrides
}: FlickerProps) {
  const opts = { ...presets[intensity], ...overrides };
  const opacity = useFlicker(opts);

  return (
    <span
      className={cn("inline-block", className)}
      style={{
        opacity,
        /* slight brightness variation simulates phosphor inconsistency */
        filter: opacity < 0.9 ? `brightness(${0.85 + opacity * 0.15})` : undefined,
      }}
    >
      {children}
    </span>
  );
}
