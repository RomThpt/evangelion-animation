import { useRef, useEffect } from "react";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";
import { DURATION, STAGGER } from "../lib/animation-presets";

export type ProgressVariant = "fill" | "segments" | "blocks";

export interface ProgressBarProps {
  value: number;
  maxValue?: number;
  segments?: number;
  label?: string;
  labelJa?: string;
  showPercentage?: boolean;
  variant?: ProgressVariant;
  className?: string;
}

export function ProgressBar({
  value,
  maxValue = 100,
  segments = 20,
  label,
  labelJa,
  showPercentage = true,
  variant = "segments",
  className,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const { locale, reducedMotion } = useEva();

  const percent = Math.min(value / maxValue, 1);
  const filledSegments = Math.round(percent * segments);

  const displayLabel = label
    ? (() => {
        const labels = tDual(commonLabels, label.toLowerCase());
        const ja = labelJa ?? (labels.ja !== label.toLowerCase() ? labels.ja : undefined);
        return formatLabel(label, locale, ja);
      })()
    : undefined;

  useEffect(() => {
    if (!barRef.current || reducedMotion || variant !== "segments") return;

    const segs = barRef.current.querySelectorAll("[data-segment]");
    const scope = createScope({ root: barRef.current });

    scope.add(() => {
      animate(segs, {
        scaleY: [0, 1],
        delay: stagger(STAGGER.cascade, { from: 0 }),
        duration: DURATION.valueChange,
        ease: "out(3)",
      });
    });

    return () => scope.revert();
  }, [filledSegments, reducedMotion, variant]);

  useEffect(() => {
    if (!barRef.current || reducedMotion || percent < 1) return;

    const scope = createScope({ root: barRef.current });
    scope.add(() => {
      animate(barRef.current!, {
        borderColor: ["var(--eva-primary)", "var(--eva-border)"],
        duration: DURATION.alertFlash * 4,
        ease: "out(2)",
      });
    });

    return () => scope.revert();
  }, [percent, reducedMotion]);

  return (
    <div className={cn("font-mono", className)}>
      {(displayLabel || showPercentage) && (
        <div className="mb-0.5 flex items-center justify-between">
          {displayLabel && (
            <span className="eva-label text-[8px]">{displayLabel}</span>
          )}
          {showPercentage && (
            <NumberRoll
              value={percent * 100}
              precision={0}
              suffix="%"
              className="text-[10px]"
            />
          )}
        </div>
      )}

      <div
        ref={barRef}
        className={cn(
          "flex h-3",
          variant === "fill" && "overflow-hidden border border-eva-border",
          variant === "segments" && "gap-px border border-eva-border",
          variant === "blocks" && "gap-1",
        )}
      >
        {variant === "fill" ? (
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${percent * 100}%`,
              background: "var(--eva-primary)",
              boxShadow: "0 0 6px var(--eva-glow), inset 0 0 3px var(--eva-glow-subtle, var(--eva-glow))",
            }}
          />
        ) : (
          Array.from({ length: segments }).map((_, i) => {
            const filled = i < filledSegments;
            const isLeading = filled && i === filledSegments - 1;
            return (
              <div
                key={i}
                data-segment
                className={cn(
                  "flex-1 origin-bottom",
                  variant === "blocks" && "border border-eva-border",
                  filled ? "" : "bg-[var(--eva-surface)]",
                  isLeading && !reducedMotion && "animate-[eva-breathing_1.5s_ease-in-out_infinite]",
                )}
                style={
                  filled
                    ? {
                        background: "var(--eva-primary)",
                        boxShadow: "inset 0 0 2px var(--eva-glow-subtle, var(--eva-glow))",
                        opacity: 0.6 + (i / segments) * 0.4, // gradient intensity
                      }
                    : undefined
                }
              />
            );
          })
        )}
      </div>
    </div>
  );
}
