import { useState, useEffect, useRef } from "react";
import { animate } from "animejs";
import { useEva } from "../provider/eva-context";
import { DURATION } from "../lib/animation-presets";

export interface UseNumberRollOptions {
  value: number;
  duration?: number;
  precision?: number;
}

export function useNumberRoll({
  value,
  duration = DURATION.numberRollDigit,
  precision = 0,
}: UseNumberRollOptions): string {
  const [displayValue, setDisplayValue] = useState(value);
  const currentRef = useRef({ v: value });
  const { reducedMotion } = useEva();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    const anim = animate(currentRef.current, {
      v: value,
      duration,
      ease: "out(3)",
      onUpdate: () => {
        setDisplayValue(currentRef.current.v);
      },
    });

    return () => {
      anim.pause();
    };
  }, [value, duration, reducedMotion]);

  return displayValue.toFixed(precision);
}
