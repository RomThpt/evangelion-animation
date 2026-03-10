import { useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { getCanvasColors } from "../provider/themes";

export type WaveformType = "sine" | "heartbeat" | "noise" | "flat" | "custom";

export interface WaveformDisplayProps {
  data?: number[];
  type?: WaveformType;
  color?: string;
  speed?: number;
  amplitude?: number;
  label?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function WaveformDisplay({
  data,
  type = "sine",
  color,
  speed = 1,
  amplitude = 1,
  label,
  width = 300,
  height = 80,
  className,
}: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const { palette, reducedMotion } = useEva();

  const colors = getCanvasColors(palette);
  const drawColor = color ?? colors.primary;

  const generateWaveform = useCallback(
    (t: number, w: number): number[] => {
      const points: number[] = [];

      switch (type) {
        case "sine":
          for (let i = 0; i < w; i++) {
            /* multi-harmonic for more organic feel */
            const base = Math.sin((i / w) * Math.PI * 4 + t * 2);
            const harmonic = Math.sin((i / w) * Math.PI * 7 + t * 3.1) * 0.15;
            const drift = Math.sin(t * 0.3) * 0.08;
            points.push((base + harmonic + drift) * amplitude);
          }
          break;
        case "heartbeat": {
          for (let i = 0; i < w; i++) {
            const phase = ((i / w) * 2.2 + t * 0.5) % 2.2;
            let v = 0;
            if (phase < 0.05) v = 0.15;
            else if (phase < 0.1) v = 0.8 + Math.random() * 0.2;
            else if (phase < 0.15) v = -0.4;
            else if (phase < 0.2) v = 0.5 + Math.random() * 0.1;
            else if (phase < 0.28) v = -0.1;
            else v = (Math.random() - 0.5) * 0.03; /* baseline noise */
            points.push(v * amplitude);
          }
          break;
        }
        case "noise":
          for (let i = 0; i < w; i++) {
            const prev = points[i - 1] ?? 0;
            /* brownian-ish noise -- more organic than pure random */
            points.push(prev * 0.85 + (Math.random() * 2 - 1) * amplitude * 0.3);
          }
          break;
        case "flat":
          for (let i = 0; i < w; i++) {
            /* not perfectly flat -- slight analog noise on flatline */
            points.push((Math.random() - 0.5) * 0.01);
          }
          break;
        case "custom":
          if (data && data.length > 0) {
            for (let i = 0; i < w; i++) {
              const idx = (i / w) * data.length;
              const lo = Math.floor(idx);
              const hi = Math.min(lo + 1, data.length - 1);
              const frac = idx - lo;
              points.push((data[lo] * (1 - frac) + data[hi] * frac) * amplitude);
            }
          } else {
            for (let i = 0; i < w; i++) points.push(0);
          }
          break;
      }

      return points;
    },
    [type, data, amplitude],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    if (reducedMotion) {
      const points = generateWaveform(0, width);
      drawFrame(ctx, points, width, height, drawColor, colors);
      return;
    }

    const render = () => {
      timeRef.current += 0.016 * speed;
      const points = generateWaveform(timeRef.current, width);
      drawFrame(ctx, points, width, height, drawColor, colors);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, drawColor, speed, reducedMotion, generateWaveform, colors]);

  return (
    <div className={cn("inline-flex flex-col font-mono", className)}>
      {label && (
        <span className="eva-label mb-0.5 text-[8px]">{label}</span>
      )}
      <div className="relative border border-eva-border bg-[var(--eva-bg)]">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="block"
        />
        {/* phosphor afterglow overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, ${drawColor}08 0%, transparent 70%)`,
          }}
        />
      </div>
    </div>
  );
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  points: number[],
  width: number,
  height: number,
  color: string,
  colors: { border: string; bg: string },
) {
  ctx.clearRect(0, 0, width, height);

  /* dark background with slight noise */
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, width, height);

  /* grid -- faint, irregular spacing like analog scope */
  ctx.strokeStyle = `${colors.border}20`;
  ctx.lineWidth = 0.5;
  const gridX = width / 8;
  const gridY = height / 4;
  for (let x = gridX; x < width; x += gridX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = gridY; y < height; y += gridY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  /* center baseline -- slightly brighter */
  ctx.strokeStyle = `${colors.border}35`;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  const mid = height / 2;
  const maxAmp = height / 2 - 4;

  /* phosphor trail (dimmer copy offset slightly) */
  ctx.strokeStyle = `${color}20`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const y = mid + points[i] * maxAmp;
    if (i === 0) ctx.moveTo(i, y + 0.5);
    else ctx.lineTo(i, y + 0.5);
  }
  ctx.stroke();

  /* main trace */
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    const y = mid + points[i] * maxAmp;
    if (i === 0) ctx.moveTo(i, y);
    else ctx.lineTo(i, y);
  }
  ctx.stroke();

  /* bright dot at the trace tip */
  const lastY = mid + (points[points.length - 1] ?? 0) * maxAmp;
  ctx.fillStyle = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(width - 1, lastY, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
}
