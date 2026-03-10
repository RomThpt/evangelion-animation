import type { EvaPalette } from "./types";

export interface EvaColorSet {
  primary: string;
  secondary: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textDim: string;
}

const palettes: Record<EvaPalette, EvaColorSet> = {
  normal: {
    primary: "#00ff41",
    secondary: "#00e5ff",
    bg: "#0a0a0a",
    surface: "#111111",
    border: "#1a3a1a",
    text: "#00ff41",
    textDim: "#007a20",
  },
  caution: {
    primary: "#ff9100",
    secondary: "#ffab40",
    bg: "#0a0a0a",
    surface: "#1a1200",
    border: "#3a2a00",
    text: "#ff9100",
    textDim: "#7a4500",
  },
  emergency: {
    primary: "#ff1744",
    secondary: "#ff5252",
    bg: "#0a0000",
    surface: "#1a0000",
    border: "#3a0000",
    text: "#ff1744",
    textDim: "#7a0b20",
  },
};

export const nervColors = {
  nerv: "#7b1fa2",
  nervLight: "#9c27b0",
};

export function getCanvasColors(palette: EvaPalette): EvaColorSet {
  return palettes[palette];
}
