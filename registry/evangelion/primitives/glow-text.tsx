import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface GlowTextProps {
  children: ReactNode;
  className?: string;
  pulse?: boolean;
  intensity?: "low" | "medium" | "high";
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

const glowMap = {
  low: "0 0 4px var(--eva-glow)",
  medium: "0 0 4px var(--eva-glow), 0 0 8px var(--eva-glow)",
  high: "0 0 4px var(--eva-glow), 0 0 8px var(--eva-glow), 0 0 16px var(--eva-glow)",
};

export function GlowText({
  children,
  className,
  pulse = false,
  intensity = "medium",
  as: Component = "span",
}: GlowTextProps) {
  return (
    <Component
      className={cn(
        "font-mono text-eva-text",
        pulse && "animate-[eva-glow-pulse_3s_ease-in-out_infinite]",
        className,
      )}
      style={pulse ? undefined : { textShadow: glowMap[intensity] }}
    >
      {children}
    </Component>
  );
}
