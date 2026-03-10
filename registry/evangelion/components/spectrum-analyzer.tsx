import { useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { getCanvasColors } from "../provider/themes";
import type { EvaColorSet } from "../provider/themes";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";
import { Scanlines } from "../primitives/scanlines";

export interface SpectrumAnalyzerProps {
  data?: number[];
  barCount?: number;
  color?: string;
  peakHold?: boolean;
  peakDecayRate?: number;
  showFrequencyLabels?: boolean;
  showAmplitudeGrid?: boolean;
  label?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function SpectrumAnalyzer({
  data,
  barCount = 32,
  color,
  peakHold = true,
  peakDecayRate = 0.3,
  showFrequencyLabels = false,
  showAmplitudeGrid = false,
  label,
  width = 300,
  height = 120,
  className,
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { palette, locale, reducedMotion } = useEva();
  const colors = getCanvasColors(palette);
  const drawColor = color ?? colors.primary;

  const currentBarsRef = useRef<number[]>([]);
  const peaksRef = useRef<number[]>([]);
  const lastTimeRef = useRef(0);

  const formattedLabel = label
    ? formatLabel(
        label,
        locale,
        tDual(commonLabels, "spectrum").ja,
      )
    : undefined;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    /* initialize bar / peak arrays when barCount changes */
    if (currentBarsRef.current.length !== barCount) {
      currentBarsRef.current = new Array(barCount).fill(0);
      peaksRef.current = new Array(barCount).fill(0);
    }

    if (reducedMotion) {
      const bars = resolveData(data, barCount);
      drawFrame(
        ctx,
        bars,
        width,
        height,
        barCount,
        drawColor,
        colors,
        peakHold ? bars : undefined,
        showAmplitudeGrid,
      );
      return;
    }

    const render = (time: number) => {
      const dt = lastTimeRef.current
        ? (time - lastTimeRef.current) / 1000
        : 0.016;
      lastTimeRef.current = time;

      const target = resolveData(data, barCount);
      const current = currentBarsRef.current;
      const peaks = peaksRef.current;

      for (let i = 0; i < barCount; i++) {
        /* smooth lerp toward target value */
        current[i] += (target[i] - current[i]) * 0.25;

        /* peak tracking: rise instantly, decay slowly */
        if (current[i] >= peaks[i]) {
          peaks[i] = current[i];
        } else {
          peaks[i] = Math.max(0, peaks[i] - peakDecayRate * dt);
        }
      }

      drawFrame(
        ctx,
        current,
        width,
        height,
        barCount,
        drawColor,
        colors,
        peakHold ? peaks : undefined,
        showAmplitudeGrid,
      );

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    width,
    height,
    drawColor,
    reducedMotion,
    colors,
    barCount,
    data,
    peakHold,
    peakDecayRate,
    showAmplitudeGrid,
  ]);

  return (
    <div className={cn("inline-flex flex-col font-mono", className)}>
      {formattedLabel && (
        <span className="eva-label mb-0.5 text-[8px]">{formattedLabel}</span>
      )}
      <div className="relative border border-eva-border bg-[var(--eva-bg)]">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="block"
        />
        <Scanlines intensity="subtle" />
      </div>
      {showFrequencyLabels && (
        <div className="flex justify-between text-[7px] text-eva-text-dim mt-0.5 px-0.5">
          <span>Lo</span>
          <span>Mid</span>
          <span>Hi</span>
        </div>
      )}
    </div>
  );
}

/**
 * Map incoming data array to the target barCount,
 * resampling or zero-filling as needed.
 */
function resolveData(data: number[] | undefined, barCount: number): number[] {
  if (!data || data.length === 0) {
    return new Array(barCount).fill(0);
  }

  const out: number[] = [];
  for (let i = 0; i < barCount; i++) {
    const idx = (i / barCount) * data.length;
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, data.length - 1);
    const frac = idx - lo;
    /* clamp 0-1 */
    const v = data[lo] * (1 - frac) + data[hi] * frac;
    out.push(Math.max(0, Math.min(1, v)));
  }
  return out;
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  bars: number[],
  width: number,
  height: number,
  barCount: number,
  color: string,
  colors: EvaColorSet,
  peaks: number[] | undefined,
  showGrid: boolean,
) {
  ctx.clearRect(0, 0, width, height);

  /* dark background */
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  /* amplitude grid lines at 0.25, 0.5, 0.75, 1.0 */
  if (showGrid) {
    ctx.strokeStyle = `${colors.border}30`;
    ctx.lineWidth = 0.5;
    for (const level of [0.25, 0.5, 0.75, 1.0]) {
      const y = height - level * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /* bar geometry */
  const gap = 1;
  const barWidth = (width - gap * (barCount - 1)) / barCount;

  /* phosphor glow setup */
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;

  for (let i = 0; i < barCount; i++) {
    const value = bars[i];
    const barHeight = value * height;
    const x = i * (barWidth + gap);
    const y = height - barHeight;

    /* bottom-up gradient: dim at bottom, bright at top */
    const grad = ctx.createLinearGradient(x, height, x, y);
    grad.addColorStop(0, `${color}40`);
    grad.addColorStop(1, color);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barWidth, barHeight);
  }

  /* peak-hold dots */
  if (peaks) {
    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    for (let i = 0; i < barCount; i++) {
      const peakValue = peaks[i];
      if (peakValue <= 0.01) continue;
      const x = i * (barWidth + gap);
      const peakY = height - peakValue * height;
      ctx.fillRect(x, peakY - 2, barWidth, 2);
    }
  }

  ctx.shadowBlur = 0;
}
