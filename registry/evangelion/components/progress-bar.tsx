import { useRef, useEffect } from "react";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { DURATION, STAGGER } from "../lib/animation-presets";

export type ProgressVariant = "fill" | "segments" | "blocks";

export interface ProgressBarProps {
  value: number;
  maxValue?: number;
  segments?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: ProgressVariant;
  className?: string;
}

export function ProgressBar({
  value,
  maxValue = 100,
  segments = 20,
  label,
  showPercentage = true,
  variant = "segments",
  className,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useEva();

  const percent = Math.min(value / maxValue, 1);
  const filledSegments = Math.round(percent * segments);

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

  // Completion flash
  useEffect(() => {
    if (!barRef.current || reducedMotion || percent < 1) return;

    const scope = createScope({ root: barRef.current });
    scope.add(() => {
      animate(barRef.current!, {
        backgroundColor: [
          "transparent",
          "var(--eva-primary)",
          "transparent",
        ],
        duration: DURATION.alertFlash * 3,
        ease: "out(2)",
      });
    });

    return () => scope.revert();
  }, [percent, reducedMotion]);

  return (
    <div className={cn("font-mono", className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between">
          {label && (
            <GlowText className="text-xs uppercase tracking-widest" intensity="low">
              {label}
            </GlowText>
          )}
          {showPercentage && (
            <NumberRoll
              value={percent * 100}
              precision={0}
              suffix="%"
              className="text-xs"
            />
          )}
        </div>
      )}

      <div
        ref={barRef}
        className={cn(
          "flex h-4 border border-eva-border",
          variant === "fill" && "overflow-hidden",
          variant === "blocks" && "gap-1 border-0",
        )}
      >
        {variant === "fill" ? (
          <div
            className="h-full bg-eva-primary transition-all duration-300"
            style={{
              width: `${percent * 100}%`,
              boxShadow: "0 0 8px var(--eva-glow)",
            }}
          />
        ) : (
          Array.from({ length: segments }).map((_, i) => {
            const filled = i < filledSegments;
            return (
              <div
                key={i}
                data-segment
                className={cn(
                  "flex-1 origin-bottom transition-colors duration-150",
                  variant === "blocks" && "border border-eva-border",
                  filled
                    ? "bg-eva-primary"
                    : "bg-eva-surface",
                  filled &&
                    i === filledSegments - 1 &&
                    "animate-[eva-breathing_2s_ease-in-out_infinite]",
                )}
                style={
                  filled
                    ? { boxShadow: "inset 0 0 4px var(--eva-glow)" }
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
