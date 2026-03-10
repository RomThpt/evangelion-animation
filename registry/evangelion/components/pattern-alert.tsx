import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { Flicker } from "../primitives/flicker";
import { formatLabel, tDual, commonLabels, formatHex } from "../lib/i18n";
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
  blue: "#2979ff",
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

  const patternLabel = tDual(commonLabels, "pattern");
  const patternTypeLabel = pattern !== "none" ? tDual(commonLabels, pattern) : null;

  useEffect(() => {
    if (!ringsRef.current || pattern === "none" || reducedMotion) return;

    const rings = ringsRef.current.querySelectorAll("[data-ring]");
    const scope = createScope({ root: ringsRef.current });

    scope.add(() => {
      animate(rings, {
        r: [8, 55],
        opacity: [0.7, 0],
        strokeWidth: [2, 0.5],
        duration: DURATION.boot * 1.5,
        ease: EASING.dataChange,
        loop: !confirmed,
        delay: (_el: unknown, i: number) => i * 250,
      });
    });

    return () => scope.revert();
  }, [pattern, confirmed, reducedMotion]);

  if (pattern === "none") return null;

  const color = patternColors[pattern];
  const displayPattern = formatLabel(
    patternTypeLabel?.en ?? "",
    locale,
    patternTypeLabel?.ja,
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "eva-clip-corner relative border bg-[var(--eva-bg)] p-5 font-mono",
          className,
        )}
        style={{ borderColor: color }}
      >
        {/* detection rings */}
        <svg
          ref={ringsRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 200 150"
          preserveAspectRatio="xMidYMid meet"
        >
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              data-ring
              cx="100"
              cy="75"
              r="8"
              fill="none"
              stroke={color}
              strokeWidth="2"
              opacity="0"
            />
          ))}
        </svg>

        <div className="relative z-10 space-y-3">
          {/* header with hex addr */}
          <div className="flex items-center justify-between text-[8px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
            <span>{formatHex(Math.floor(Math.random() * 65535))}</span>
            <span>
              {formatLabel(patternLabel.en, locale, patternLabel.ja)}
            </span>
          </div>

          {/* pattern type -- big */}
          <div className="text-center">
            <Flicker intensity={confirmed ? "subtle" : "moderate"}>
              <GlowText
                className="text-3xl font-bold tracking-[0.4em]"
                intensity="high"
                pulse={!confirmed}
              >
                <span style={{ color }}>{displayPattern}</span>
              </GlowText>
            </Flicker>
          </div>

          {/* designation */}
          {designation && (
            <div className="text-center">
              <span className="text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">{">>> "}</span>
              <TypeWriter
                text={designation}
                className="text-xs"
                speed={25}
                jitter
              />
            </div>
          )}

          {/* classification */}
          {classification && (
            <div className="text-center">
              <span
                className={cn(
                  "text-xs",
                  !confirmed && !reducedMotion && "animate-[eva-blink-hard_1.2s_steps(1)_infinite]",
                )}
                style={{ color }}
              >
                {classification}
              </span>
            </div>
          )}

          {/* confidence */}
          <div>
            <div className="mb-0.5 flex items-center justify-between">
              <span className="eva-label text-[8px]">CONFIDENCE</span>
              <NumberRoll value={confidence} precision={1} suffix="%" className="text-[10px]" />
            </div>
            <div className="h-1.5 border border-eva-border">
              <motion.div
                className="h-full"
                style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}60` }}
                initial={{ width: "0%" }}
                animate={{ width: `${confidence}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {!confirmed && onConfirm && (
              <button
                className="eva-clip-corner-sm border px-4 py-1 text-[10px] uppercase tracking-[0.15em] transition-colors hover:bg-[var(--eva-surface)]"
                style={{ borderColor: color, color }}
                onClick={onConfirm}
              >
                {formatLabel("CONFIRM", locale, "\u78BA\u8A8D")}
              </button>
            )}
            {onDismiss && (
              <button
                className="border border-eva-border px-4 py-1 text-[10px] uppercase tracking-[0.15em] text-eva-text-dim transition-colors hover:bg-[var(--eva-surface)]"
                onClick={onDismiss}
              >
                DISMISS
              </button>
            )}
            {confirmed && (
              <GlowText className="text-xs font-bold uppercase tracking-[0.2em]" intensity="high">
                <span style={{ color }}>
                  {formatLabel("CONFIRMED", locale, "\u78BA\u8A8D\u6E08\u307F")}
                </span>
              </GlowText>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
