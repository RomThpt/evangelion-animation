import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { t, commonLabels } from "../lib/i18n";
import { DURATION, EASING } from "../lib/animation-presets";

export type PatternType = "blue" | "orange" | "none";

export interface PatternAlertProps {
  pattern: PatternType;
  classification?: string;
  confidence: number;
  designation?: string;
  confirmed?: boolean;
  onConfirm?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const patternColors: Record<PatternType, string> = {
  blue: "#2196f3",
  orange: "#ff9100",
  none: "var(--eva-text-dim)",
};

export function PatternAlert({
  pattern,
  classification,
  confidence,
  designation,
  confirmed = false,
  onConfirm,
  onDismiss,
  className,
}: PatternAlertProps) {
  const ringsRef = useRef<SVGSVGElement>(null);
  const { locale, reducedMotion } = useEva();

  const patternLabel = t(commonLabels, "pattern", locale);
  const patternTypeLabel = pattern !== "none" ? t(commonLabels, pattern, locale) : "";

  useEffect(() => {
    if (!ringsRef.current || pattern === "none" || reducedMotion) return;

    const rings = ringsRef.current.querySelectorAll("[data-ring]");
    const scope = createScope({ root: ringsRef.current });

    scope.add(() => {
      animate(rings, {
        r: [10, 60],
        opacity: [0.8, 0],
        strokeWidth: [3, 1],
        duration: DURATION.boot * 1.5,
        ease: EASING.dataChange,
        loop: !confirmed,
        delay: (_el: unknown, i: number) => i * 300,
      });
    });

    return () => scope.revert();
  }, [pattern, confirmed, reducedMotion]);

  if (pattern === "none") return null;

  const color = patternColors[pattern];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "relative border-2 bg-eva-bg p-6 font-mono",
          className,
        )}
        style={{ borderColor: color }}
      >
        {/* Detection rings */}
        <svg
          ref={ringsRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMidYMid meet"
        >
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              data-ring
              cx="100"
              cy="100"
              r="10"
              fill="none"
              stroke={color}
              strokeWidth="2"
              opacity="0"
            />
          ))}
        </svg>

        <div className="relative z-10 space-y-3">
          {/* Pattern type */}
          <div className="text-center">
            <span className="text-xs text-eva-text-dim">{patternLabel}</span>
            <GlowText
              className="mt-1 block text-3xl font-bold tracking-widest"
              intensity="high"
              pulse={!confirmed}
            >
              <span style={{ color }}>{patternTypeLabel}</span>
            </GlowText>
          </div>

          {/* Designation */}
          {designation && (
            <div className="text-center">
              <TypeWriter
                text={designation}
                className="text-sm"
                speed={30}
              />
            </div>
          )}

          {/* Classification */}
          {classification && (
            <div className="text-center">
              <span className="text-xs text-eva-text-dim">
                {confirmed ? "" : ">> "}
              </span>
              <span
                className={cn(
                  "text-sm",
                  !confirmed && !reducedMotion && "animate-[eva-pulse_1s_steps(1)_infinite]",
                )}
                style={{ color }}
              >
                {classification}
              </span>
            </div>
          )}

          {/* Confidence bar */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-eva-text-dim">CONFIDENCE</span>
              <NumberRoll value={confidence} precision={1} suffix="%" className="text-xs" />
            </div>
            <div className="h-2 border border-eva-border">
              <motion.div
                className="h-full"
                style={{ backgroundColor: color }}
                initial={{ width: "0%" }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            {!confirmed && onConfirm && (
              <button
                className="border px-4 py-1 text-xs uppercase tracking-wider hover:bg-eva-surface"
                style={{ borderColor: color, color }}
                onClick={onConfirm}
              >
                {t(commonLabels, "confirmed", locale)}
              </button>
            )}
            {onDismiss && (
              <button
                className="border border-eva-border px-4 py-1 text-xs uppercase tracking-wider text-eva-text-dim hover:bg-eva-surface"
                onClick={onDismiss}
              >
                DISMISS
              </button>
            )}
            {confirmed && (
              <GlowText
                className="text-sm font-bold uppercase tracking-widest"
                intensity="high"
              >
                <span style={{ color }}>
                  {t(commonLabels, "confirmed", locale)}
                </span>
              </GlowText>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
