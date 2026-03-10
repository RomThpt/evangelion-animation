import { useRef, useEffect, useCallback } from "react";
import { createScope, type Scope } from "animejs";
import { useEva } from "../provider/eva-context";

export interface UseEvaAnimationReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  scope: React.RefObject<Scope | null>;
}

export function useEvaAnimation(): UseEvaAnimationReturn {
  const rootRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<Scope | null>(null);
  const { reducedMotion } = useEva();

  useEffect(() => {
    if (!rootRef.current || reducedMotion) return;

    scopeRef.current = createScope({ root: rootRef.current });

    return () => {
      scopeRef.current?.revert();
      scopeRef.current = null;
    };
  }, [reducedMotion]);

  return { ref: rootRef, scope: scopeRef };
}

export function useAnimationCallback(
  callback: (scope: Scope) => void | (() => void),
  deps: unknown[],
  ref: React.RefObject<HTMLDivElement | null>,
) {
  const { reducedMotion } = useEva();

  const stableCallback = useCallback(callback, deps);

  useEffect(() => {
    if (!ref.current || reducedMotion) return;

    const scope = createScope({ root: ref.current });
    const cleanup = stableCallback(scope);

    return () => {
      cleanup?.();
      scope.revert();
    };
  }, [stableCallback, reducedMotion, ref]);
}
