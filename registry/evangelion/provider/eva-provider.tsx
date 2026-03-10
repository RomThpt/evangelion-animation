import { useState, useMemo, useEffect, type ReactNode } from "react";
import { EvaContext } from "./eva-context";
import type { EvaPalette, EvaLocale, EvaConfig } from "./types";

export interface EvaProviderProps {
  palette?: EvaPalette;
  locale?: EvaLocale;
  scanlines?: boolean;
  flicker?: boolean;
  animationSpeed?: number;
  children: ReactNode;
}

export function EvaProvider({
  palette: initialPalette = "normal",
  locale: initialLocale = "ja",
  scanlines = true,
  flicker = true,
  animationSpeed = 1,
  children,
}: EvaProviderProps) {
  const [palette, setPalette] = useState<EvaPalette>(initialPalette);
  const [locale, setLocale] = useState<EvaLocale>(initialLocale);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Sync with controlled prop
  useEffect(() => {
    setPalette(initialPalette);
  }, [initialPalette]);

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const value = useMemo<EvaConfig>(
    () => ({
      palette,
      setPalette,
      locale,
      setLocale,
      scanlines,
      flicker,
      animationSpeed: reducedMotion ? 0 : animationSpeed,
      reducedMotion,
    }),
    [palette, locale, scanlines, flicker, animationSpeed, reducedMotion],
  );

  return (
    <EvaContext value={value}>
      <div data-eva-palette={palette} className="contents">
        {children}
      </div>
    </EvaContext>
  );
}
