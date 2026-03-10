import { useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { t, commonLabels } from "../lib/i18n";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { locale, reducedMotion } = useEva();

  const displayLabel = label ?? t(commonLabels, "syncRate", locale);

  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const percent = Math.min(value / maxValue, 1);
  const dashOffset = circumference * (1 - percent * 0.75); // 270-degree arc

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

  return (
    <motion.div
      ref={containerRef}
      className={cn("relative inline-flex flex-col items-center font-mono", className)}
      animate={
        thresholdState === "critical"
          ? { opacity: [1, 0.7, 1] }
          : undefined
      }
      transition={
        thresholdState === "critical"
          ? { duration: 0.5, repeat: Infinity }
          : undefined
      }
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[225deg]"
      >
        {/* Background arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--eva-border)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="butt"
        />
        {/* Value arc */}
        <circle
          ref={arcRef}
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={
            thresholdState === "critical"
              ? "var(--eva-secondary)"
              : "var(--eva-primary)"
          }
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={reducedMotion ? dashOffset : circumference}
          strokeLinecap="butt"
          style={{
            filter: "drop-shadow(0 0 4px var(--eva-glow))",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <NumberRoll
          value={value}
          precision={1}
          suffix="%"
          className={cn(
            "text-2xl",
            thresholdState === "critical" && "text-eva-secondary",
          )}
        />
        {pilotName && (
          <span className="mt-1 text-xs uppercase text-eva-text-dim">
            {pilotName}
          </span>
        )}
      </div>

      <GlowText className="mt-2 text-xs uppercase tracking-widest" intensity="low">
        {displayLabel}
      </GlowText>
    </motion.div>
  );
}
