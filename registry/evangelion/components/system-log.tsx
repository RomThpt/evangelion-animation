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
  info: "text-eva-text",
  warning: "text-amber-500",
  error: "text-red-500",
  system: "text-eva-secondary",
};

const levelPrefixes: Record<LogLevel, string> = {
  info: "INFO",
  warning: "WARN",
  error: "ERR!",
  system: "SYS ",
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
        "overflow-y-auto border border-eva-border bg-eva-bg font-mono text-xs",
        className,
      )}
      style={{ maxHeight: maxVisible * 24 }}
    >
      <AnimatePresence initial={false}>
        {visibleEntries.map((entry) => (
          <motion.div
            key={entry.id}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className={cn(
              "flex gap-2 border-b border-eva-border/30 px-2 py-1",
              entry.level === "error" && "bg-red-950/20",
            )}
          >
            <span className="shrink-0 text-eva-text-dim">
              {entry.timestamp}
            </span>
            <span
              className={cn("shrink-0 font-bold", levelColors[entry.level])}
            >
              [{levelPrefixes[entry.level]}]
            </span>
            {entry.source && (
              <span className="shrink-0 text-eva-text-dim">
                {entry.source}:
              </span>
            )}
            <span className={levelColors[entry.level]}>
              {entry.id === newestId && !reducedMotion ? (
                <TypeWriter text={entry.message} speed={15} cursor={false} />
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
