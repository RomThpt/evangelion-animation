import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { GlowText } from "../primitives/glow-text";
import { Flicker } from "../primitives/flicker";
import { Scanlines } from "../primitives/scanlines";
import { formatLabel, formatBlock, tDual, commonLabels } from "../lib/i18n";
import { DURATION, EASING } from "../lib/animation-presets";

export type TerminalEntryLevel = "input" | "output" | "error" | "system";

export interface TerminalEntry {
  id: string;
  timestamp: string;
  message: string;
  level: TerminalEntryLevel;
}

export interface CommandTerminalProps {
  prompt?: string;
  history?: TerminalEntry[];
  maxHistory?: number;
  onCommand?: (command: string) => void;
  bootSequence?: string[];
  disabled?: boolean;
  label?: string;
  labelJa?: string;
  code?: string;
  className?: string;
}

const levelColors: Record<TerminalEntryLevel, string> = {
  input: "var(--eva-primary)",
  output: "var(--eva-text)",
  error: "#ff1744",
  system: "var(--eva-secondary, var(--eva-primary))",
};

const levelTags: Record<TerminalEntryLevel, string> = {
  input: "CMD",
  output: "OUT",
  error: "ERR",
  system: "SYS",
};

export function CommandTerminal({
  prompt = "NERV://> ",
  history = [],
  maxHistory = 50,
  onCommand,
  bootSequence,
  disabled = false,
  label,
  labelJa,
  code,
  className,
}: CommandTerminalProps) {
  const [inputValue, setInputValue] = useState("");
  const [bootIndex, setBootIndex] = useState(0);
  const [booted, setBooted] = useState(!bootSequence?.length);

  const containerRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<SVGPathElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { locale, reducedMotion } = useEva();

  const titleEn = label ?? "TERMINAL";
  const labels = tDual(commonLabels, titleEn.toLowerCase());
  const jaText = labelJa ?? labels.ja;
  const displayTitle = formatLabel(
    titleEn,
    locale,
    jaText !== titleEn.toLowerCase() ? jaText : undefined,
  );

  const visibleEntries = history.slice(-maxHistory);
  const newestId = visibleEntries[visibleEntries.length - 1]?.id;

  /* ---- SVG border draw-on animation ---- */
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

  /* ---- auto-scroll on new entries or boot progress ---- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history?.length, bootIndex]);

  /* ---- auto-focus input when booted and enabled ---- */
  useEffect(() => {
    if (booted && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [booted, disabled]);

  /* ---- submit handler with flash animation ---- */
  const handleSubmit = useCallback(() => {
    if (!inputValue.trim() || disabled) return;
    onCommand?.(inputValue.trim());
    setInputValue("");

    if (containerRef.current && !reducedMotion) {
      const scope = createScope({ root: containerRef.current });
      scope.add(() => {
        animate(containerRef.current!, {
          borderColor: ["var(--eva-primary)", "var(--eva-border)"],
          duration: DURATION.alertFlash * 4,
          ease: "out(2)",
        });
      });
    }
  }, [inputValue, disabled, onCommand, reducedMotion]);

  return (
    <div ref={containerRef} className={cn("relative font-mono", className)}>
      {/* angular border with clipped corners */}
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

      {/* header */}
      <div className="flex items-center gap-2 border-b border-eva-border px-3 py-1.5">
        {/* status pip */}
        <Flicker intensity="subtle">
          <div
            className={cn(
              "h-1.5 w-1.5",
              disabled
                ? "bg-eva-text-dim"
                : "bg-[var(--eva-primary)] shadow-[0_0_4px_var(--eva-glow)]",
            )}
          />
        </Flicker>

        {/* block code */}
        {code && (
          <span className="text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
            {formatBlock(code, "")}
          </span>
        )}

        {/* title */}
        <TypeWriter
          text={displayTitle}
          className="eva-label text-[10px]"
          speed={25}
          cursor={false}
          jitter
        />
      </div>

      {/* output area */}
      <div
        ref={scrollRef}
        className="overflow-y-auto p-2"
        style={{ maxHeight: 300 }}
      >
        {/* boot sequence lines */}
        {!booted && bootSequence && (
          <>
            {bootSequence.slice(0, bootIndex + 1).map((line, i) => (
              <div
                key={`boot-${i}`}
                className="py-0.5 text-[11px]"
                style={{
                  color: "var(--eva-secondary, var(--eva-primary))",
                }}
              >
                {i < bootIndex ? (
                  line
                ) : (
                  <TypeWriter
                    text={line}
                    speed={15}
                    cursor={false}
                    jitter
                    onComplete={() => {
                      if (i === bootSequence.length - 1) {
                        setBooted(true);
                      } else {
                        setBootIndex((prev) => prev + 1);
                      }
                    }}
                  />
                )}
              </div>
            ))}
          </>
        )}

        {/* history entries */}
        {booted && (
          <AnimatePresence initial={false}>
            {visibleEntries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={
                  reducedMotion ? { opacity: 1 } : { opacity: 0, x: -8 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.15 }}
                className={cn(
                  "flex gap-1.5 px-2 py-0.5 text-[11px] leading-[1.6]",
                  entry.level === "error" && "bg-[rgba(255,0,0,0.04)]",
                )}
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
                <span
                  style={{
                    color:
                      entry.level === "error"
                        ? "#ff1744"
                        : "var(--eva-text)",
                  }}
                >
                  {entry.id === newestId && !reducedMotion ? (
                    <TypeWriter
                      text={entry.message}
                      speed={12}
                      cursor={false}
                      jitter
                    />
                  ) : (
                    entry.message
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* input row */}
      {booted && (
        <div className="flex items-center border-t border-eva-border px-2 py-1">
          <GlowText intensity="low">
            <span
              className="shrink-0 text-[11px]"
              style={{ color: "var(--eva-primary)" }}
            >
              {prompt}
            </span>
          </GlowText>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            disabled={disabled}
            className="flex-1 bg-transparent text-[11px] text-eva-text outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          {!disabled && (
            <span
              className="animate-[eva-blink-hard_1s_steps(1)_infinite]"
              style={{ color: "var(--eva-primary)" }}
            >
              {"\u2588"}
            </span>
          )}
        </div>
      )}

      <Scanlines intensity="subtle" />
    </div>
  );
}
