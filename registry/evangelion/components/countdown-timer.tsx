import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { GlowText } from "../primitives/glow-text";
import { NumberRoll } from "../primitives/number-roll";

export type CountdownFormat = "HH:MM:SS" | "MM:SS" | "SS.ms";

export interface CountdownTimerProps {
  targetTime: number;
  format?: CountdownFormat;
  label?: string;
  warningThreshold?: number;
  criticalThreshold?: number;
  onComplete?: () => void;
  paused?: boolean;
  className?: string;
}

export function CountdownTimer({
  targetTime,
  format = "MM:SS",
  label,
  warningThreshold = 60,
  criticalThreshold = 10,
  onComplete,
  paused = false,
  className,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(targetTime);
  const completedRef = useRef(false);
  const { reducedMotion } = useEva();

  useEffect(() => {
    setRemaining(targetTime);
    completedRef.current = false;
  }, [targetTime]);

  useEffect(() => {
    if (paused || remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        if (next === 0 && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, remaining, onComplete]);

  const formatTime = useCallback(
    (s: number) => {
      const hrs = Math.floor(s / 3600);
      const mins = Math.floor((s % 3600) / 60);
      const secs = s % 60;

      switch (format) {
        case "HH:MM:SS":
          return { segments: [hrs, mins, secs], labels: ["H", "M", "S"] };
        case "MM:SS":
          return { segments: [mins, secs], labels: ["M", "S"] };
        case "SS.ms":
          return { segments: [secs, 0], labels: ["S", "ms"] };
      }
    },
    [format],
  );

  const { segments, labels } = formatTime(remaining);

  const thresholdState =
    remaining <= criticalThreshold
      ? "critical"
      : remaining <= warningThreshold
        ? "warning"
        : "normal";

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center font-mono",
        thresholdState === "critical" &&
          !reducedMotion &&
          "animate-[eva-pulse_0.5s_steps(1)_infinite]",
        className,
      )}
    >
      {label && (
        <GlowText className="mb-2 text-xs uppercase tracking-widest" intensity="low">
          {label}
        </GlowText>
      )}
      <div className="flex items-baseline gap-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-baseline">
            {i > 0 && (
              <span
                className={cn(
                  "mx-1 text-2xl",
                  thresholdState === "critical"
                    ? "text-red-500"
                    : thresholdState === "warning"
                      ? "text-amber-500"
                      : "text-eva-text-dim",
                )}
              >
                :
              </span>
            )}
            <NumberRoll
              value={seg}
              precision={0}
              className={cn(
                "text-4xl tabular-nums",
                thresholdState === "critical" && "text-red-500",
                thresholdState === "warning" && "text-amber-500",
              )}
            />
            <span className="ml-0.5 text-xs text-eva-text-dim">{labels[i]}</span>
          </div>
        ))}
      </div>
      {paused && (
        <span className="mt-1 text-xs uppercase tracking-wider text-eva-text-dim animate-[eva-pulse_1s_steps(1)_infinite]">
          PAUSED
        </span>
      )}
    </div>
  );
}
