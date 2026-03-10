import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { DURATION } from "../lib/animation-presets";

export interface TypeWriterProps {
  text: string;
  className?: string;
  speed?: number;
  cursor?: boolean;
  onComplete?: () => void;
  delay?: number;
}

export function TypeWriter({
  text,
  className,
  speed = DURATION.typewriterChar,
  cursor = true,
  onComplete,
  delay = 0,
}: TypeWriterProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const counterRef = useRef({ count: 0 });
  const { reducedMotion } = useEva();
  const completeCalled = useRef(false);

  useEffect(() => {
    completeCalled.current = false;
    counterRef.current.count = 0;
    setVisibleCount(0);

    if (reducedMotion) {
      setVisibleCount(text.length);
      onComplete?.();
      return;
    }

    const anim = animate(counterRef.current, {
      count: text.length,
      duration: text.length * speed,
      delay,
      ease: "linear",
      modifier: (v: number) => Math.floor(v),
      onUpdate: () => {
        setVisibleCount(counterRef.current.count);
      },
      onComplete: () => {
        if (!completeCalled.current) {
          completeCalled.current = true;
          onComplete?.();
        }
      },
    });

    return () => {
      anim.pause();
    };
  }, [text, speed, delay, reducedMotion, onComplete]);

  return (
    <span className={cn("font-mono text-eva-text", className)}>
      {text.slice(0, visibleCount)}
      {cursor && visibleCount < text.length && (
        <span className="animate-[eva-pulse_1s_steps(1)_infinite]">_</span>
      )}
    </span>
  );
}
