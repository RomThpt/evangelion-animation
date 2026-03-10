import type { EvaPalette } from "../provider/types";
import { getCanvasColors, type EvaColorSet } from "../provider/themes";

export function getComputedEvaColor(
  property: string,
  element?: HTMLElement,
): string {
  const el = element ?? document.documentElement;
  return getComputedStyle(el).getPropertyValue(property).trim();
}

export function getColorsForCanvas(palette: EvaPalette): EvaColorSet {
  return getCanvasColors(palette);
}
