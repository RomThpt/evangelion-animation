import { useRef, useEffect } from "react";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { DURATION } from "../lib/animation-presets";

export type DataTrend = "up" | "down" | "stable";

export interface DataReadoutProps {
  label: string;
  value: number;
  unit?: string;
  precision?: number;
  trend?: DataTrend;
  flashOnChange?: boolean;
  className?: string;
}

const trendArrows: Record<DataTrend, string> = {
  up: "\u25B2",
  down: "\u25BC",
  stable: "\u25C6",
};

export function DataReadout({
  label,
  value,
  unit = "",
  precision = 1,
  trend = "stable",
  flashOnChange = true,
  className,
}: DataReadoutProps) {
  const flashRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);
  const { reducedMotion } = useEva();

  useEffect(() => {
    if (
      !flashRef.current ||
      !flashOnChange ||
      reducedMotion ||
      prevValueRef.current === value
    ) {
      prevValueRef.current = value;
      return;
    }

    prevValueRef.current = value;

    const scope = createScope({ root: flashRef.current });
    scope.add(() => {
      animate(flashRef.current!, {
        backgroundColor: [
          "var(--eva-primary)",
          "transparent",
        ],
        duration: DURATION.alertFlash * 2,
        ease: "out(2)",
      });
    });

    return () => scope.revert();
  }, [value, flashOnChange, reducedMotion]);

  return (
    <div
      ref={flashRef}
      className={cn(
        "inline-flex flex-col gap-0.5 border border-eva-border px-3 py-2 font-mono",
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-widest text-eva-text-dim">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <NumberRoll
          value={value}
          precision={precision}
          className="text-lg"
        />
        {unit && (
          <span className="text-xs text-eva-text-dim">{unit}</span>
        )}
        <GlowText
          className={cn(
            "ml-1 text-xs transition-transform duration-300",
            trend === "up" && "text-eva-primary",
            trend === "down" && "text-eva-secondary",
          )}
          intensity="low"
        >
          {trendArrows[trend]}
        </GlowText>
      </div>
    </div>
  );
}
