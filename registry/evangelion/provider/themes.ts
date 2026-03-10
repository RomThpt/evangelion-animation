import type { EvaPalette } from "./types";

export interface EvaColorSet {
  primary: string;
  primaryBright: string;
  secondary: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textDim: string;
  glow: string;
  glowSubtle: string;
}

const palettes: Record<EvaPalette, EvaColorSet> = {
  normal: {
    primary: "#00ff41",
    primaryBright: "#33ff66",
    secondary: "#00d4aa",
    bg: "#010a01",
    surface: "#061206",
    border: "#0d3b0d",
    text: "#00ff41",
    textDim: "#006118",
    glow: "rgba(0,255,65,0.6)",
    glowSubtle: "rgba(0,255,65,0.15)",
  },
  caution: {
    primary: "#ff9100",
    primaryBright: "#ffab40",
    secondary: "#ffd740",
    bg: "#0a0600",
    surface: "#1a0f00",
    border: "#3d2800",
    text: "#ff9100",
    textDim: "#8a4e00",
    glow: "rgba(255,145,0,0.6)",
    glowSubtle: "rgba(255,145,0,0.15)",
  },
  emergency: {
    primary: "#ff1744",
    primaryBright: "#ff5252",
    secondary: "#ff8a80",
    bg: "#0a0000",
    surface: "#1a0000",
    border: "#3d0000",
    text: "#ff1744",
    textDim: "#8a0b22",
    glow: "rgba(255,23,68,0.6)",
    glowSubtle: "rgba(255,23,68,0.15)",
  },
};

export const nervColors = {
  nerv: "#7b1fa2",
  nervLight: "#9c27b0",
  nervDark: "#4a0072",
};

export function getCanvasColors(palette: EvaPalette): EvaColorSet {
  return palettes[palette];
}
