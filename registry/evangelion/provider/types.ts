export type EvaPalette = "normal" | "caution" | "emergency";

export type EvaLocale = "ja" | "en";

export interface EvaConfig {
  palette: EvaPalette;
  setPalette: (palette: EvaPalette) => void;
  locale: EvaLocale;
  setLocale: (locale: EvaLocale) => void;
  scanlines: boolean;
  flicker: boolean;
  animationSpeed: number;
  reducedMotion: boolean;
}
