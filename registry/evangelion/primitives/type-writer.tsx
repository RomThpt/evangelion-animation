import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";

export interface TypeWriterProps {
  text: string;
  className?: string;
  /** ms per character (base -- actual timing has jitter) */
  speed?: number;
  cursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
  delay?: number;
  /** adds slight randomness to timing like a real teletype */
  jitter?: boolean;
}

export function TypeWriter({
  text,
  className,
  speed = 35,
  cursor = true,
  cursorChar = "\u2588",
  onComplete,
  delay = 0,
  jitter = true,
}: TypeWriterProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const { reducedMotion } = useEva();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const completeRef = useRef(false);

  const getDelay = useCallback(
    (char: string) => {
      if (!jitter) return speed;
      /* punctuation and spaces get slightly longer pauses */
      if (char === " ") return speed * (1.2 + Math.random() * 0.3);
      if (".,:;".includes(char)) return speed * (2 + Math.random());
      /* occasional micro-hesitation */
      if (Math.random() < 0.08) return speed * (2.5 + Math.random() * 2);
      /* normal jitter range */
      return speed * (0.6 + Math.random() * 0.8);
    },
    [speed, jitter],
  );

  useEffect(() => {
    completeRef.current = false;
    setVisibleCount(0);

    if (reducedMotion) {
      setVisibleCount(text.length);
      onComplete?.();
      return;
    }

    let count = 0;

    const tick = () => {
      if (count >= text.length) {
        if (!completeRef.current) {
          completeRef.current = true;
          onComplete?.();
        }
        return;
      }
      count++;
      setVisibleCount(count);
      const nextChar = text[count] ?? " ";
      timeoutRef.current = setTimeout(tick, getDelay(nextChar));
    };

    timeoutRef.current = setTimeout(tick, delay || getDelay(text[0] ?? " "));

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, delay, reducedMotion, onComplete, getDelay]);

  const done = visibleCount >= text.length;

  return (
    <span className={cn("font-mono text-eva-text", className)}>
      <span>{text.slice(0, visibleCount)}</span>
      {cursor && (
        <span
          className={cn(
            done
              ? "animate-[eva-blink-hard_1s_steps(1)_infinite]"
              : "opacity-100",
          )}
          style={{ color: "var(--eva-primary)" }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
}
