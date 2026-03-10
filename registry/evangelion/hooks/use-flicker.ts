import { useRef, useEffect, useCallback, useState } from "react";
import { useEva } from "../provider/eva-context";

export interface UseFlickerOptions {
  minOpacity?: number;
  maxOpacity?: number;
  minInterval?: number;
  maxInterval?: number;
  enabled?: boolean;
}

export function useFlicker({
  minOpacity = 0.85,
  maxOpacity = 1.0,
  minInterval = 50,
  maxInterval = 200,
  enabled = true,
}: UseFlickerOptions = {}): number {
  const [opacity, setOpacity] = useState(1);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const nextIntervalRef = useRef(0);
  const { flicker: globalFlicker, reducedMotion } = useEva();

  const active = enabled && globalFlicker && !reducedMotion;

  const getRandomInterval = useCallback(
    () => minInterval + Math.random() * (maxInterval - minInterval),
    [minInterval, maxInterval],
  );

  useEffect(() => {
    if (!active) {
      setOpacity(1);
      return;
    }

    nextIntervalRef.current = getRandomInterval();

    const tick = (time: number) => {
      if (time - lastTimeRef.current >= nextIntervalRef.current) {
        lastTimeRef.current = time;
        nextIntervalRef.current = getRandomInterval();
        setOpacity(minOpacity + Math.random() * (maxOpacity - minOpacity));
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, minOpacity, maxOpacity, getRandomInterval]);

  return opacity;
}
