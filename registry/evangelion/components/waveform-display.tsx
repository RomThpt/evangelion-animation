import { useRef, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { getCanvasColors } from "../provider/themes";
import { GlowText } from "../primitives/glow-text";

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

  const drawColor = color ?? getCanvasColors(palette).primary;

  const generateWaveform = useCallback(
    (t: number, w: number): number[] => {
      const points: number[] = [];

      switch (type) {
        case "sine":
          for (let i = 0; i < w; i++) {
            points.push(
              Math.sin((i / w) * Math.PI * 4 + t * 2) * amplitude,
            );
          }
          break;
        case "heartbeat":
          for (let i = 0; i < w; i++) {
            const phase = ((i / w) * 2 + t * 0.5) % 2;
            if (phase < 0.1) points.push(amplitude * 0.3);
            else if (phase < 0.15) points.push(amplitude);
            else if (phase < 0.2) points.push(-amplitude * 0.5);
            else if (phase < 0.25) points.push(amplitude * 0.6);
            else if (phase < 0.3) points.push(0);
            else points.push(0);
          }
          break;
        case "noise":
          for (let i = 0; i < w; i++) {
            points.push((Math.random() * 2 - 1) * amplitude * 0.5);
          }
          break;
        case "flat":
          for (let i = 0; i < w; i++) {
            points.push(0);
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
      // Draw static frame
      const points = generateWaveform(0, width);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = drawColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      const mid = height / 2;
      const maxAmp = height / 2 - 4;
      for (let i = 0; i < points.length; i++) {
        const y = mid + points[i] * maxAmp;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      return;
    }

    const draw = () => {
      timeRef.current += 0.016 * speed;
      const points = generateWaveform(timeRef.current, width);

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.strokeStyle = `${drawColor}15`;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < height; y += height / 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Waveform
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = drawColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      const mid = height / 2;
      const maxAmp = height / 2 - 4;
      for (let i = 0; i < points.length; i++) {
        const y = mid + points[i] * maxAmp;
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();

      // Reset shadow
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, drawColor, speed, reducedMotion, generateWaveform]);

  return (
    <div className={cn("inline-flex flex-col font-mono", className)}>
      {label && (
        <GlowText className="mb-1 text-xs uppercase tracking-widest" intensity="low">
          {label}
        </GlowText>
      )}
      <div className="relative border border-eva-border bg-eva-bg">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="block"
        />
      </div>
    </div>
  );
}
