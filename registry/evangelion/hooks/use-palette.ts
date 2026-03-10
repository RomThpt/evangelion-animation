import { useEva } from "../provider/eva-context";
import { getCanvasColors, type EvaColorSet } from "../provider/themes";
import type { EvaPalette } from "../provider/types";

export interface UsePaletteReturn {
  palette: EvaPalette;
  setPalette: (palette: EvaPalette) => void;
  colors: EvaColorSet;
}

export function usePalette(): UsePaletteReturn {
  const { palette, setPalette } = useEva();
  const colors = getCanvasColors(palette);
  return { palette, setPalette, colors };
}
