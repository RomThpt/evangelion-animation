import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { GlowText } from "../primitives/glow-text";
import { TypeWriter } from "../primitives/type-writer";
import { Flicker } from "../primitives/flicker";
import { formatLabel, tDual, commonLabels, formatHex } from "../lib/i18n";
import { DURATION } from "../lib/animation-presets";

export type AlertLevel = "info" | "caution" | "emergency";

export interface AlertOverlayProps {
  level: AlertLevel;
  message: string;
  code?: string;
  visible?: boolean;
  dismissible?: boolean;
  onAlertTrigger?: (level: AlertLevel) => void;
  onDismiss?: () => void;
  className?: string;
}

export function AlertOverlay({
  level,
  message,
  code,
  visible = true,
  dismissible = true,
  onAlertTrigger,
  onDismiss,
  className,
}: AlertOverlayProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { locale, reducedMotion } = useEva();
  const triggeredRef = useRef(false);

  const labels = tDual(commonLabels, level === "info" ? "info" : level);
  const levelText = formatLabel(labels.en, locale, labels.ja);

  useEffect(() => {
    if (visible && !triggeredRef.current) {
      triggeredRef.current = true;
      onAlertTrigger?.(level);
    }
    if (!visible) triggeredRef.current = false;
  }, [visible, level, onAlertTrigger]);

  useEffect(() => {
    if (!contentRef.current || !visible || reducedMotion) return;

    const children = contentRef.current.querySelectorAll("[data-eva-animate]");
    const scope = createScope({ root: contentRef.current });

    scope.add(() => {
      animate(children, {
        opacity: [0, 1],
        translateY: [15, 0],
        delay: stagger(DURATION.staggerElement),
        duration: DURATION.boot * 0.5,
        ease: "out(3)",
      });
    });

    return () => scope.revert();
  }, [visible, reducedMotion]);

  const handleDismiss = () => {
    if (dismissible) onDismiss?.();
  };

  const alertColor = level === "emergency" ? "#ff1744" : level === "caution" ? "#ff9100" : "var(--eva-primary)";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center font-mono",
            className,
          )}
          style={{
            backgroundColor: level === "emergency"
              ? "rgba(10,0,0,0.85)"
              : level === "caution"
                ? "rgba(10,6,0,0.8)"
                : "rgba(0,0,0,0.8)",
          }}
          onClick={handleDismiss}
          onKeyDown={(e) => { if (e.key === "Escape") handleDismiss(); }}
          role="alertdialog"
          aria-modal="true"
          aria-label={`${levelText}: ${message}`}
          tabIndex={-1}
        >
          {/* top chevron bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 overflow-hidden">
            <div className={cn("flex h-full gap-2", !reducedMotion && "animate-[scroll-left_3s_linear_infinite]")}>
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className="inline-block shrink-0 text-lg leading-8" style={{ color: `${alertColor}30` }}>
                  {"\u25B6"}
                </span>
              ))}
            </div>
          </div>

          {/* bottom chevron bar */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 overflow-hidden">
            <div className={cn("flex h-full gap-2", !reducedMotion && "animate-[scroll-right_3s_linear_infinite]")}>
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className="inline-block shrink-0 text-lg leading-8" style={{ color: `${alertColor}30` }}>
                  {"\u25C0"}
                </span>
              ))}
            </div>
          </div>

          {/* edge lines */}
          <div className="pointer-events-none absolute inset-y-8 left-0 w-px" style={{ background: `${alertColor}40` }} />
          <div className="pointer-events-none absolute inset-y-8 right-0 w-px" style={{ background: `${alertColor}40` }} />

          {/* main content */}
          <div
            ref={contentRef}
            className="eva-clip-corner relative max-w-lg border bg-[var(--eva-bg)] p-6"
            style={{ borderColor: alertColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* corner decorations */}
            <div className="absolute left-2 top-2 text-[8px]" style={{ color: `${alertColor}50` }}>
              {formatHex(Date.now() % 65535)}
            </div>
            <div className="absolute right-2 top-2 text-[8px]" style={{ color: `${alertColor}50` }}>
              {code ?? "---"}
            </div>

            <div className="space-y-4 pt-3 text-center" data-eva-animate>
              {/* level label */}
              <Flicker intensity={level === "emergency" ? "heavy" : "moderate"}>
                <GlowText
                  className="text-2xl font-bold tracking-[0.3em]"
                  pulse={level === "emergency"}
                  intensity="high"
                >
                  <span style={{ color: alertColor }}>{levelText}</span>
                </GlowText>
              </Flicker>
            </div>

            {/* separator */}
            <div data-eva-animate className="my-3 h-px" style={{ background: `${alertColor}40` }} />

            {/* message */}
            <div data-eva-animate>
              <TypeWriter
                text={message}
                speed={20}
                jitter
                className="text-xs leading-relaxed"
                cursorChar="_"
              />
            </div>

            {/* dismiss */}
            {dismissible && (
              <div data-eva-animate className="mt-5 text-center">
                <button
                  className="eva-clip-corner-sm border px-5 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors hover:bg-[var(--eva-surface)]"
                  style={{ borderColor: alertColor, color: alertColor }}
                  onClick={handleDismiss}
                >
                  DISMISS
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
