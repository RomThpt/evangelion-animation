import { createContext, useContext } from "react";
import type { EvaConfig } from "./types";

const defaultConfig: EvaConfig = {
  palette: "normal",
  setPalette: () => {},
  locale: "ja",
  setLocale: () => {},
  scanlines: true,
  flicker: true,
  animationSpeed: 1,
  reducedMotion: false,
};

export const EvaContext = createContext<EvaConfig>(defaultConfig);

export function useEva(): EvaConfig {
  return useContext(EvaContext);
}
