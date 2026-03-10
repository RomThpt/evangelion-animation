import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { Flicker } from "../primitives/flicker";
import { TypeWriter } from "../primitives/type-writer";
import { Scanlines } from "../primitives/scanlines";
import { formatLabel, formatBlock, tDual, commonLabels } from "../lib/i18n";
import { DURATION, EASING, STAGGER } from "../lib/animation-presets";

export type PowerChannelStatus = "active" | "standby" | "severed";

export interface PowerChannel {
  id: string;
  label: string;
  labelJa?: string;
  /** Current load (e.g. watts) */
  load: number;
  /** Maximum capacity */
  capacity: number;
  status: PowerChannelStatus;
}

export interface PowerGridProps {
  channels: PowerChannel[];
  totalOutput?: number;
  /** Unit for total output display, default "MW" */
  totalOutputUnit?: string;
  /** Battery level 0-100 */
  batteryLevel?: number;
  /** Battery remaining time, e.g. "04:59" */
  batteryTime?: string;
  /** Ratio at which segments turn red, 0-1, default 0.85 */
  criticalThreshold?: number;
  label?: string;
  labelJa?: string;
  code?: string;
  onChannelClick?: (id: string) => void;
  className?: string;
}

const STATUS_SEGMENT_COUNT = 16;
const BATTERY_SEGMENT_COUNT = 10;

const statusLabels = {
  active: { ja: "稼働", en: "ACTIVE" },
  standby: { ja: "待機", en: "STANDBY" },
  severed: { ja: "切断", en: "SEVERED" },
} as const;

export function PowerGrid({
  channels,
  totalOutput,
  totalOutputUnit = "MW",
  batteryLevel,
  batteryTime,
  criticalThreshold = 0.85,
  label,
  labelJa,
  code,
  onChannelClick,
  className,
}: PowerGridProps) {
  const borderRef = useRef<SVGPathElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const segmentsRef = useRef<HTMLDivElement>(null);
  const { locale, reducedMotion } = useEva();

  // Resolve display title
  const titleEn = label ?? "POWER GRID";
  const labels = tDual(commonLabels, titleEn.toLowerCase());
  const jaText = labelJa ?? (labels.ja !== titleEn.toLowerCase() ? labels.ja : undefined);
  const displayTitle = formatLabel(titleEn, locale, jaText);

  // Battery label
  const batteryLabels = tDual(commonLabels, "battery");
  const batteryLabel = formatLabel(batteryLabels.en, locale, batteryLabels.ja);

  // SVG border draw-on animation
  useEffect(() => {
    if (!borderRef.current || reducedMotion) return;

    const path = borderRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const scope = createScope({ root: path.closest("svg")! });
    scope.add(() => {
      animate(path, {
        strokeDashoffset: [length, 0],
        duration: DURATION.boot * 1.2,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [reducedMotion]);

  // Flow pulse dot animation
  useEffect(() => {
    if (!flowRef.current || reducedMotion) return;

    const dots = flowRef.current.querySelectorAll("[data-flow-dot]");
    if (!dots.length) return;

    const scope = createScope({ root: flowRef.current });
    scope.add(() => {
      animate(dots, {
        translateX: [0, 60],
        opacity: [1, 0.3, 1],
        duration: 1200,
        ease: "linear",
        loop: true,
      });
    });

    return () => scope.revert();
  }, [channels, reducedMotion]);

  // Segment stagger animation
  useEffect(() => {
    if (!segmentsRef.current || reducedMotion) return;

    const segs = segmentsRef.current.querySelectorAll("[data-segment]");
    if (!segs.length) return;

    const scope = createScope({ root: segmentsRef.current });
    scope.add(() => {
      animate(segs, {
        scaleY: [0, 1],
        delay: stagger(STAGGER.cascade, { from: 0 }),
        duration: DURATION.valueChange,
        ease: "out(3)",
      });
    });

    return () => scope.revert();
  }, [channels, reducedMotion]);

  function renderChannel(ch: PowerChannel) {
    const ratio = ch.capacity > 0 ? ch.load / ch.capacity : 0;
    const isCritical = ratio > criticalThreshold;
    const filledCount = Math.round(Math.min(ratio, 1) * STATUS_SEGMENT_COUNT);

    const chLabels = tDual(commonLabels, ch.label.toLowerCase());
    const chJa = ch.labelJa ?? (chLabels.ja !== ch.label.toLowerCase() ? chLabels.ja : undefined);
    const formattedLabel = formatLabel(ch.label, locale, chJa);

    const statusEntry = statusLabels[ch.status];
    const statusLabel = locale === "ja" ? statusEntry.ja : statusEntry.en;

    return (
      <div
        key={ch.id}
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 border-b border-[var(--eva-surface)]",
          onChannelClick && "cursor-pointer hover:bg-[var(--eva-surface)]",
        )}
        onClick={onChannelClick ? () => onChannelClick(ch.id) : undefined}
        role={onChannelClick ? "button" : undefined}
        tabIndex={onChannelClick ? 0 : undefined}
        onKeyDown={
          onChannelClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChannelClick(ch.id);
                }
              }
            : undefined
        }
      >
        {/* Status pip */}
        <Flicker intensity={ch.status === "severed" ? "heavy" : "subtle"}>
          <div
            className={cn(
              "h-1.5 w-1.5",
              ch.status === "active" && "bg-[var(--eva-primary)] shadow-[0_0_4px_var(--eva-glow)]",
              ch.status === "standby" && "bg-eva-text-dim",
              ch.status === "severed" && "bg-[#ff1744] shadow-[0_0_6px_rgba(255,0,0,0.6)]",
            )}
          />
        </Flicker>

        {/* Label */}
        <span className="min-w-[60px] text-[9px] eva-label">{formattedLabel}</span>

        {/* Status tag */}
        <span
          className={cn(
            "text-[8px] uppercase tracking-wider",
            ch.status === "active" && "text-[var(--eva-primary)]",
            ch.status === "standby" && "text-eva-text-dim",
            ch.status === "severed" && "text-[#ff1744]",
          )}
        >
          {statusLabel}
        </span>

        {/* Flow line with animated pulse dot */}
        <div className="relative flex-1 h-px bg-[var(--eva-border)]">
          {ch.status === "active" && (
            <div
              data-flow-dot
              className="absolute top-[-2px] left-0 h-[5px] w-[5px] rounded-full"
              style={{
                background: "var(--eva-primary)",
                boxShadow: "0 0 4px var(--eva-glow)",
              }}
            />
          )}
        </div>

        {/* Segmented load bar */}
        <div className="flex gap-px w-24">
          {Array.from({ length: STATUS_SEGMENT_COUNT }).map((_, i) => {
            const filled = i < filledCount;
            const critical = filled && isCritical;
            return (
              <div
                key={i}
                data-segment
                className={cn(
                  "h-3 flex-1 origin-bottom",
                  filled ? "" : "bg-[var(--eva-surface)]",
                )}
                style={
                  filled
                    ? {
                        background: critical ? "#ff1744" : "var(--eva-primary)",
                        boxShadow: critical
                          ? "0 0 4px rgba(255,23,68,0.4)"
                          : "inset 0 0 2px var(--eva-glow-subtle, var(--eva-glow))",
                      }
                    : undefined
                }
              />
            );
          })}
        </div>

        {/* Load percentage with critical flash */}
        {isCritical && !reducedMotion ? (
          <motion.span
            animate={{ opacity: [1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
          >
            <NumberRoll
              value={ratio * 100}
              precision={0}
              suffix="%"
              className="text-[10px] w-10 text-right"
            />
          </motion.span>
        ) : (
          <NumberRoll
            value={ratio * 100}
            precision={0}
            suffix="%"
            className="text-[10px] w-10 text-right"
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative font-mono", className)}>
      {/* SVG angular border */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          ref={borderRef}
          d="M8,0 L100%,0 L100%,calc(100% - 8px) L calc(100% - 8px),100% L0,100% L0,8 Z"
          fill="none"
          stroke="var(--eva-border)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-eva-border px-3 py-1.5">
        <div className="flex items-center gap-2">
          {code && (
            <span className="text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
              {formatBlock(code, "")}
            </span>
          )}
          <TypeWriter
            text={displayTitle}
            className="eva-label text-[10px]"
            speed={25}
            cursor={false}
            jitter
          />
        </div>
        {totalOutput != null && (
          <div className="flex items-center gap-1">
            <NumberRoll value={totalOutput} precision={1} className="text-sm" />
            <span className="text-[8px] text-eva-text-dim">{totalOutputUnit}</span>
          </div>
        )}
      </div>

      {/* Channel rows */}
      <div ref={flowRef}>
        <div ref={segmentsRef}>
          {channels.map((ch) => renderChannel(ch))}
        </div>
      </div>

      {/* Battery sub-panel */}
      {batteryLevel != null && (
        <div className="border-t border-eva-border px-2 py-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="eva-label text-[8px]">{batteryLabel}</span>
            <NumberRoll
              value={batteryLevel}
              precision={0}
              suffix="%"
              className="text-[10px]"
            />
          </div>
          {/* Block-style battery bar */}
          <div className="flex gap-1 h-2">
            {Array.from({ length: BATTERY_SEGMENT_COUNT }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 border",
                  i < Math.round(batteryLevel / BATTERY_SEGMENT_COUNT)
                    ? batteryLevel < 20
                      ? "border-[#ff1744] bg-[#ff174460]"
                      : "border-eva-border bg-[var(--eva-primary)]"
                    : "border-eva-border bg-[var(--eva-surface)]",
                )}
              />
            ))}
          </div>
          {batteryTime && (
            <div className="mt-0.5 text-right text-[8px] text-eva-text-dim">
              {batteryTime}
            </div>
          )}
        </div>
      )}

      <Scanlines intensity="subtle" />
    </div>
  );
}
