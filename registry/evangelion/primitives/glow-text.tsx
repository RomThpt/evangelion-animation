import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export interface GlowTextProps {
  children: ReactNode;
  className?: string;
  pulse?: boolean;
  intensity?: "low" | "medium" | "high";
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
}

export function GlowText({
  children,
  className,
  pulse = false,
  intensity = "medium",
  as: Component = "span",
}: GlowTextProps) {
  /* phosphor bloom -- each level adds more diffuse outer glow */
  const glowStyle = (() => {
    switch (intensity) {
      case "low":
        return {
          textShadow: "0 0 2px var(--eva-glow)",
        };
      case "medium":
        return {
          textShadow: [
            "0 0 1px var(--eva-glow-strong, var(--eva-glow))",
            "0 0 4px var(--eva-glow)",
            "0 0 12px var(--eva-glow-subtle, var(--eva-glow))",
          ].join(", "),
        };
      case "high":
        return {
          textShadow: [
            "0 0 1px var(--eva-glow-strong, var(--eva-glow))",
            "0 0 4px var(--eva-glow)",
            "0 0 14px var(--eva-glow)",
            "0 0 30px var(--eva-glow-subtle, var(--eva-glow))",
            "0 0 50px var(--eva-glow-subtle, var(--eva-glow))",
          ].join(", "),
        };
    }
  })();

  return (
    <Component
      className={cn(
        "font-mono text-eva-text",
        pulse && "animate-[eva-glow-pulse_2.5s_ease-in-out_infinite]",
        className,
      )}
      style={pulse ? undefined : glowStyle}
    >
      {children}
    </Component>
  );
}
