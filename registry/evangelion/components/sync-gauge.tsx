import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { Flicker } from "../primitives/flicker";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";
import { DURATION, EASING } from "../lib/animation-presets";

export interface SyncGaugeThresholds {
  warning: number;
  critical: number;
}

export interface SyncGaugeProps {
  value: number;
  maxValue?: number;
  label?: string;
  pilotName?: string;
  thresholds?: SyncGaugeThresholds;
  size?: number;
  onThresholdCross?: (direction: "above" | "below") => void;
  className?: string;
}

export function SyncGauge({
  value,
  maxValue = 100,
  label,
  pilotName,
  thresholds = { warning: 30, critical: 15 },
  size = 160,
  onThresholdCross,
  className,
}: SyncGaugeProps) {
  const arcRef = useRef<SVGCircleElement>(null);
  const prevValueRef = useRef(value);
  const { locale, reducedMotion } = useEva();

  const labels = tDual(commonLabels, "syncRate");
  const displayLabel = label ?? formatLabel(labels.en, locale, labels.ja);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const percent = Math.min(value / maxValue, 1);
  const arcSpan = 0.75; // 270 degrees
  const dashOffset = circumference * (1 - percent * arcSpan);

  const thresholdState = useMemo(() => {
    if (value <= thresholds.critical) return "critical";
    if (value <= thresholds.warning) return "warning";
    return "normal";
  }, [value, thresholds]);

  useEffect(() => {
    const prev = prevValueRef.current;
    prevValueRef.current = value;

    if (
      (prev > thresholds.warning && value <= thresholds.warning) ||
      (prev > thresholds.critical && value <= thresholds.critical)
    ) {
      onThresholdCross?.("below");
    } else if (
      (prev <= thresholds.warning && value > thresholds.warning) ||
      (prev <= thresholds.critical && value > thresholds.critical)
    ) {
      onThresholdCross?.("above");
    }
  }, [value, thresholds, onThresholdCross]);

  useEffect(() => {
    if (!arcRef.current || reducedMotion) return;

    const scope = createScope({ root: arcRef.current.closest("svg")! });
    scope.add(() => {
      animate(arcRef.current!, {
        strokeDashoffset: dashOffset,
        duration: DURATION.valueChange,
        ease: EASING.dataChange,
      });
    });

    return () => scope.revert();
  }, [dashOffset, reducedMotion]);

  /* tick marks around the arc */
  const ticks = Array.from({ length: 27 }, (_, i) => {
    const angle = (i / 26) * 270 - 225;
    const rad = (angle * Math.PI) / 180;
    const inner = radius - 6;
    const outer = i % 5 === 0 ? radius + 2 : radius - 2;
    return {
      x1: center + inner * Math.cos(rad),
      y1: center + inner * Math.sin(rad),
      x2: center + outer * Math.cos(rad),
      y2: center + outer * Math.sin(rad),
      major: i % 5 === 0,
    };
  });

  return (
    <motion.div
      className={cn("relative inline-flex flex-col items-center font-mono", className)}
      animate={
        thresholdState === "critical" && !reducedMotion
          ? { opacity: [1, 0.6, 1] }
          : undefined
      }
      transition={
        thresholdState === "critical"
          ? { duration: 0.4, repeat: Infinity, ease: "linear" }
          : undefined
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[225deg]"
      >
        {/* tick marks */}
        {ticks.map((tick, i) => (
          <line
            key={i}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.major ? "var(--eva-text-dim)" : "var(--eva-border)"}
            strokeWidth={tick.major ? 1.5 : 0.5}
          />
        ))}

        {/* background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--eva-border)"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - arcSpan)}
          strokeLinecap="butt"
        />

        {/* value arc */}
        <circle
          ref={arcRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={thresholdState === "critical" ? "#ff1744" : "var(--eva-primary)"}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={reducedMotion ? dashOffset : circumference}
          strokeLinecap="butt"
          style={{
            filter: `drop-shadow(0 0 3px ${thresholdState === "critical" ? "rgba(255,23,68,0.8)" : "var(--eva-glow)"})`,
          }}
        />
      </svg>

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flicker intensity={thresholdState === "critical" ? "heavy" : "subtle"}>
          <NumberRoll
            value={value}
            precision={1}
            suffix="%"
            className={cn(
              "text-xl",
              thresholdState === "critical" && "text-red-500",
            )}
          />
        </Flicker>
        {pilotName && (
          <span className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[var(--eva-text-muted,var(--eva-text-dim))]">
            {pilotName}
          </span>
        )}
      </div>

      {/* label below */}
      <span className="eva-label mt-1 text-[9px]">
        {displayLabel}
      </span>
    </motion.div>
  );
}
