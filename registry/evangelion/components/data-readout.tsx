import { useRef, useEffect } from "react";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { Flicker } from "../primitives/flicker";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";
import { DURATION } from "../lib/animation-presets";

export type DataTrend = "up" | "down" | "stable";

export interface DataReadoutProps {
  label: string;
  labelJa?: string;
  value: number;
  unit?: string;
  precision?: number;
  trend?: DataTrend;
  flashOnChange?: boolean;
  className?: string;
}

const trendChars: Record<DataTrend, string> = {
  up: "\u25B2",
  down: "\u25BC",
  stable: "\u25C6",
};

export function DataReadout({
  label,
  labelJa,
  value,
  unit = "",
  precision = 1,
  trend = "stable",
  flashOnChange = true,
  className,
}: DataReadoutProps) {
  const flashRef = useRef<HTMLDivElement>(null);
  const prevValueRef = useRef(value);
  const { locale, reducedMotion } = useEva();

  const labels = tDual(commonLabels, label.toLowerCase());
  const ja = labelJa ?? (labels.ja !== label.toLowerCase() ? labels.ja : undefined);
  const displayLabel = formatLabel(label, locale, ja);

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
        borderColor: ["var(--eva-primary)", "var(--eva-border)"],
        duration: DURATION.alertFlash * 3,
        ease: "out(2)",
      });
    });

    return () => scope.revert();
  }, [value, flashOnChange, reducedMotion]);

  return (
    <div
      ref={flashRef}
      className={cn(
        "inline-flex flex-col gap-0 border border-eva-border bg-[var(--eva-bg)] px-2 py-1.5 font-mono",
        className,
      )}
    >
      <span className="eva-label text-[8px]">{displayLabel}</span>
      <div className="flex items-baseline gap-1">
        <Flicker intensity="subtle">
          <NumberRoll
            value={value}
            precision={precision}
            className="text-base leading-tight"
          />
        </Flicker>
        {unit && (
          <span className="text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">{unit}</span>
        )}
        <span
          className={cn(
            "ml-0.5 text-[8px]",
            trend === "up" && "text-[var(--eva-primary)]",
            trend === "down" && "text-red-500",
            trend === "stable" && "text-[var(--eva-text-muted,var(--eva-text-dim))]",
          )}
        >
          {trendChars[trend]}
        </span>
      </div>
    </div>
  );
}
