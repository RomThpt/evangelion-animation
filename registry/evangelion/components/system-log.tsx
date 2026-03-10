import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";

export type LogLevel = "info" | "warning" | "error" | "system";

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: LogLevel;
  source?: string;
}

export interface SystemLogProps {
  entries: LogEntry[];
  maxVisible?: number;
  autoScroll?: boolean;
  className?: string;
}

const levelColors: Record<LogLevel, string> = {
  info: "var(--eva-text-dim)",
  warning: "#ff9100",
  error: "#ff1744",
  system: "var(--eva-secondary, var(--eva-primary))",
};

const levelTags: Record<LogLevel, string> = {
  info: "INFO",
  warning: "WARN",
  error: "ERR!",
  system: "SYS\u00A0",
};

export function SystemLog({
  entries,
  maxVisible = 20,
  autoScroll = true,
  className,
}: SystemLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useEva();
  const visibleEntries = entries.slice(-maxVisible);
  const newestId = visibleEntries[visibleEntries.length - 1]?.id;

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length, autoScroll]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "overflow-y-auto border border-eva-border bg-[var(--eva-bg)] font-mono text-[11px] leading-[1.6]",
        className,
      )}
      style={{ maxHeight: maxVisible * 22 }}
    >
      <AnimatePresence initial={false}>
        {visibleEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            className={cn(
              "flex gap-1.5 border-b border-[var(--eva-border)]/ px-2 py-0.5",
              entry.level === "error" && "bg-[rgba(255,0,0,0.04)]",
            )}
            style={{ borderColor: "var(--eva-surface)" }}
          >
            <span className="shrink-0 text-[var(--eva-text-muted,var(--eva-text-dim))]">
              {entry.timestamp}
            </span>
            <span
              className="shrink-0 font-bold"
              style={{ color: levelColors[entry.level] }}
            >
              [{levelTags[entry.level]}]
            </span>
            {entry.source && (
              <span className="shrink-0 text-[var(--eva-text-muted,var(--eva-text-dim))]">
                {entry.source}:
              </span>
            )}
            <span style={{ color: entry.level === "error" ? "#ff1744" : entry.level === "warning" ? "#ff9100" : "var(--eva-text)" }}>
              {entry.id === newestId && !reducedMotion ? (
                <TypeWriter text={entry.message} speed={12} cursor={false} jitter />
              ) : (
                entry.message
              )}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
