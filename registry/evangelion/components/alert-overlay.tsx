import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { GlowText } from "../primitives/glow-text";
import { TypeWriter } from "../primitives/type-writer";
import { t, commonLabels } from "../lib/i18n";
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

const levelStyles: Record<AlertLevel, string> = {
  info: "border-eva-primary",
  caution: "border-amber-500",
  emergency: "border-red-500",
};

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

  const levelLabel = t(commonLabels, level === "info" ? "info" : level, locale);

  useEffect(() => {
    if (visible && !triggeredRef.current) {
      triggeredRef.current = true;
      onAlertTrigger?.(level);
    }
    if (!visible) {
      triggeredRef.current = false;
    }
  }, [visible, level, onAlertTrigger]);

  useEffect(() => {
    if (!contentRef.current || !visible || reducedMotion) return;

    const scope = createScope({ root: contentRef.current });
    const children = contentRef.current.querySelectorAll("[data-eva-animate]");

    scope.add(() => {
      animate(children, {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(DURATION.staggerElement),
        duration: DURATION.boot * 0.6,
        ease: "out(3)",
      });
    });

    return () => scope.revert();
  }, [visible, reducedMotion]);

  const handleDismiss = () => {
    if (dismissible) onDismiss?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3 }}
          className={cn(
            "fixed inset-0 z-[100] flex items-center justify-center font-mono",
            level === "emergency" &&
              "animate-[eva-pulse_0.5s_steps(1)_infinite] bg-red-950/40",
            level === "caution" && "bg-amber-950/30",
            level === "info" && "bg-eva-bg/80",
            className,
          )}
          onClick={handleDismiss}
          onKeyDown={(e) => {
            if (e.key === "Escape") handleDismiss();
          }}
          role="alertdialog"
          aria-modal="true"
          aria-label={`${levelLabel}: ${message}`}
          tabIndex={-1}
        >
          {/* Chevron bars */}
          <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
            <div
              className={cn(
                "flex h-8 gap-4",
                !reducedMotion && "animate-[scroll-left_4s_linear_infinite]",
              )}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className={cn(
                    "h-8 w-8 shrink-0",
                    level === "emergency" ? "fill-red-500/30" : "fill-amber-500/30",
                  )}
                >
                  <path d="M8 4l8 8-8 8V4z" />
                </svg>
              ))}
            </div>
          </div>

          <div
            ref={contentRef}
            className={cn(
              "max-w-md border-2 bg-eva-bg/95 p-8 text-center",
              levelStyles[level],
            )}
          >
            <div data-eva-animate>
              <GlowText
                className={cn(
                  "text-3xl font-bold tracking-widest",
                  level === "emergency" && "text-red-500",
                  level === "caution" && "text-amber-500",
                )}
                pulse={level === "emergency"}
                intensity="high"
              >
                {levelLabel.toUpperCase()}
              </GlowText>
            </div>

            {code && (
              <div data-eva-animate className="mt-2">
                <span className="text-xs tracking-wider text-eva-text-dim">
                  CODE: {code}
                </span>
              </div>
            )}

            <div data-eva-animate className="mt-4">
              <TypeWriter
                text={message}
                speed={25}
                className={cn(
                  "text-sm",
                  level === "emergency"
                    ? "text-red-400"
                    : level === "caution"
                      ? "text-amber-400"
                      : "text-eva-text",
                )}
              />
            </div>

            {dismissible && (
              <div data-eva-animate className="mt-6">
                <button
                  className={cn(
                    "border px-4 py-1 text-xs uppercase tracking-wider",
                    levelStyles[level],
                    "hover:bg-eva-surface",
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss();
                  }}
                >
                  DISMISS
                </button>
              </div>
            )}
          </div>

          {/* Bottom chevrons */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden">
            <div
              className={cn(
                "flex h-8 gap-4",
                !reducedMotion && "animate-[scroll-right_4s_linear_infinite]",
              )}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <svg
                  key={i}
                  viewBox="0 0 24 24"
                  className={cn(
                    "h-8 w-8 shrink-0 rotate-180",
                    level === "emergency" ? "fill-red-500/30" : "fill-amber-500/30",
                  )}
                >
                  <path d="M8 4l8 8-8 8V4z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
