import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { GlowText } from "../primitives/glow-text";
import { Flicker } from "../primitives/flicker";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";

export type NotificationLevel = "info" | "caution" | "warning" | "emergency";

export interface NotificationItem {
  id: string;
  message: string;
  level: NotificationLevel;
  /** ms before auto-dismiss; 0 = no auto-dismiss */
  duration?: number;
  /** technical code like "E-303" */
  code?: string;
}

export interface NotificationBannerProps {
  notifications: NotificationItem[];
  edge?: "top" | "bottom";
  maxVisible?: number;
  onDismiss?: (id: string) => void;
  className?: string;
}

const levelColors: Record<NotificationLevel, string> = {
  info: "var(--eva-primary)",
  caution: "#ff9100",
  warning: "#ff9100",
  emergency: "#ff1744",
};

const levelLabels: Record<NotificationLevel, string> = {
  info: "info",
  caution: "caution",
  warning: "warning",
  emergency: "emergency",
};

const flickerIntensity: Record<NotificationLevel, "subtle" | "moderate" | "heavy"> = {
  info: "subtle",
  caution: "moderate",
  warning: "moderate",
  emergency: "heavy",
};

const ARC_RADIUS = 8;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

function NotificationStrip({
  item,
  isNewest,
  edge,
  onDismiss,
}: {
  item: NotificationItem;
  isNewest: boolean;
  edge: "top" | "bottom";
  onDismiss?: (id: string) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { locale, reducedMotion } = useEva();

  const color = levelColors[item.level];
  const labels = tDual(commonLabels, levelLabels[item.level]);
  const levelText = formatLabel(labels.en, locale, labels.ja);
  const hasDuration = item.duration != null && item.duration > 0;
  const durationSec = hasDuration ? item.duration! / 1000 : 0;

  useEffect(() => {
    if (!hasDuration || !onDismiss) return;

    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, item.duration!);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [item.id, item.duration, hasDuration, onDismiss]);

  const handleDismiss = useCallback(() => {
    onDismiss?.(item.id);
  }, [item.id, onDismiss]);

  const slideY = edge === "top" ? -40 : 40;

  return (
    <motion.div
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: slideY }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: slideY }}
      transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeOut" }}
      className="eva-clip-corner relative overflow-hidden border bg-[var(--eva-bg)] font-mono"
      style={{ borderColor: color }}
    >
      {/* strip content */}
      <div className="flex items-center gap-2 px-3 py-1.5">
        {/* level pip */}
        <Flicker intensity={flickerIntensity[item.level]}>
          <span
            className={cn(
              "inline-block h-2 w-2 shrink-0 rounded-full",
              item.level === "emergency" && !reducedMotion &&
                "animate-[eva-blink-hard_1s_steps(1)_infinite]",
            )}
            style={{
              backgroundColor: color,
              boxShadow: `0 0 4px ${color}`,
            }}
          />
        </Flicker>

        {/* level label */}
        <GlowText
          className="shrink-0 text-[10px] font-bold uppercase tracking-[0.15em]"
          intensity={item.level === "emergency" ? "high" : "low"}
        >
          <span style={{ color }}>{levelText}</span>
        </GlowText>

        {/* code */}
        {item.code && (
          <span className="shrink-0 text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
            [{item.code}]
          </span>
        )}

        {/* message */}
        <span className="min-w-0 flex-1 truncate text-xs text-eva-text">
          {isNewest && !reducedMotion ? (
            <TypeWriter text={item.message} speed={18} cursor={false} jitter />
          ) : (
            item.message
          )}
        </span>

        {/* countdown arc */}
        {hasDuration && !reducedMotion && (
          <svg
            className="shrink-0"
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <circle
              cx="10"
              cy="10"
              r={ARC_RADIUS}
              fill="none"
              stroke={`${color}30`}
              strokeWidth="1.5"
            />
            <motion.circle
              cx="10"
              cy="10"
              r={ARC_RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={ARC_CIRCUMFERENCE}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: ARC_CIRCUMFERENCE }}
              transition={{
                duration: durationSec,
                ease: "linear",
              }}
              style={{
                transform: "rotate(-90deg)",
                transformOrigin: "center",
              }}
            />
          </svg>
        )}

        {/* dismiss button */}
        <button
          className="shrink-0 border border-eva-border px-1.5 py-0.5 text-[9px] text-eva-text-dim transition-colors hover:bg-[var(--eva-surface)] hover:text-eva-text"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
        >
          X
        </button>
      </div>

      {/* progress depletion bar */}
      {hasDuration && (
        <motion.div
          className="h-[2px]"
          style={{
            backgroundColor: color,
            transformOrigin: "left",
            boxShadow: `0 0 3px ${color}60`,
          }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{
            duration: reducedMotion ? 0 : durationSec,
            ease: "linear",
          }}
        />
      )}
    </motion.div>
  );
}

export function NotificationBanner({
  notifications,
  edge = "top",
  maxVisible = 5,
  onDismiss,
  className,
}: NotificationBannerProps) {
  const visible = notifications.slice(-maxVisible);
  const newestId = visible[visible.length - 1]?.id;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-[90] flex flex-col gap-1 px-4 py-2",
        edge === "top" ? "top-0" : "bottom-0",
        className,
      )}
      role="log"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false}>
        {visible.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <NotificationStrip
              item={item}
              isNewest={item.id === newestId}
              edge={edge}
              onDismiss={onDismiss}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
