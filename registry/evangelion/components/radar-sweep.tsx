import { useRef, useEffect } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { getCanvasColors } from "../provider/themes";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";

export type RadarTargetType = "hostile" | "friendly" | "unknown";

export interface RadarTarget {
  id: string;
  /** degrees, 0 = north/top */
  angle: number;
  /** 0-1 normalized (0 = center, 1 = edge) */
  range: number;
  type: RadarTargetType;
  label?: string;
}

export interface RadarSweepProps {
  targets?: RadarTarget[];
  /** rotations per second */
  sweepSpeed?: number;
  /** number of concentric range rings */
  rangeRings?: number;
  /** show distance labels on rings */
  rangeLabels?: boolean;
  /** show N/E/S/W compass labels */
  compassLabels?: boolean;
  /** phosphor decay time in ms */
  blipDecayMs?: number;
  /** diameter in px */
  size?: number;
  label?: string;
  className?: string;
}

const TARGET_COLORS: Record<RadarTargetType, string> = {
  hostile: "#ff1744",
  friendly: "", // filled at render time from palette
  unknown: "#ff9100",
};

/** angular proximity threshold in radians (~5 degrees) */
const SWEEP_HIT_THRESHOLD = (5 * Math.PI) / 180;

/** half-size of diamond blip in px */
const BLIP_HALF = 4;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Normalize an angle in radians to [0, 2pi).
 */
function normalizeAngle(rad: number): number {
  return ((rad % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

/**
 * Smallest signed difference between two angles, in [-pi, pi].
 */
function angleDiff(a: number, b: number): number {
  let d = normalizeAngle(a) - normalizeAngle(b);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function RadarSweep({
  targets = [],
  sweepSpeed = 0.5,
  rangeRings = 3,
  rangeLabels = false,
  compassLabels = true,
  blipDecayMs = 2000,
  size = 250,
  label,
  className,
}: RadarSweepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const sweepAngleRef = useRef(0);
  const blipTimesRef = useRef<Map<string, number>>(new Map());
  const { palette, locale, reducedMotion } = useEva();
  const colors = getCanvasColors(palette);

  const radarLabels = tDual(commonLabels, "radar");
  const formattedLabel = label
    ? formatLabel(label, locale)
    : formatLabel(radarLabels.en, locale, radarLabels.ja);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    if (reducedMotion) {
      drawRadarFrame(
        ctx,
        size,
        0,
        targets,
        blipTimesRef.current,
        0,
        blipDecayMs,
        rangeRings,
        rangeLabels,
        compassLabels,
        colors,
      );
      return;
    }

    let lastTime = 0;

    const render = (time: number) => {
      const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;

      const prevAngle = sweepAngleRef.current;
      sweepAngleRef.current =
        (sweepAngleRef.current + dt * sweepSpeed * Math.PI * 2) %
        (Math.PI * 2);

      // Check if sweep passed over any targets
      for (const target of targets) {
        // Convert target angle: 0 = north (top), clockwise
        // Canvas: 0 = right, so north = -PI/2
        const targetRad = normalizeAngle(degToRad(target.angle) - Math.PI / 2);
        const diff = angleDiff(sweepAngleRef.current, targetRad);

        // Also check if sweep crossed over the target between frames
        const prevDiff = angleDiff(prevAngle, targetRad);

        if (
          Math.abs(diff) < SWEEP_HIT_THRESHOLD ||
          (prevDiff < 0 && diff >= 0 && Math.abs(diff) < Math.PI / 4)
        ) {
          blipTimesRef.current.set(target.id, time);
        }
      }

      drawRadarFrame(
        ctx,
        size,
        sweepAngleRef.current,
        targets,
        blipTimesRef.current,
        time,
        blipDecayMs,
        rangeRings,
        rangeLabels,
        compassLabels,
        colors,
      );

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, reducedMotion, colors, sweepSpeed, targets, rangeRings, rangeLabels, compassLabels, blipDecayMs]);

  return (
    <div
      className={cn("inline-flex flex-col items-center font-mono", className)}
    >
      {formattedLabel && (
        <span className="eva-label mb-1 text-[8px]">{formattedLabel}</span>
      )}
      <div className="relative rounded-full border border-eva-border overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="block"
        />
        {/* phosphor glow overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle, ${colors.primary}08 0%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
}

function drawRadarFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  sweepAngle: number,
  targets: RadarTarget[],
  blipTimes: Map<string, number>,
  now: number,
  blipDecayMs: number,
  rangeRings: number,
  rangeLabels: boolean,
  compassLabels: boolean,
  colors: ReturnType<typeof getCanvasColors>,
) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 2;
  const usableRadius = radius - 12; // inset for compass labels

  // Clear + fill background
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = colors.bg;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Range rings
  ctx.strokeStyle = colors.border + "40";
  ctx.lineWidth = 0.5;
  for (let i = 1; i <= rangeRings; i++) {
    const r = (usableRadius / (rangeRings + 1)) * (i);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    if (rangeLabels) {
      ctx.save();
      ctx.fillStyle = colors.textDim;
      ctx.font = "7px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const rangeVal = Math.round((i / (rangeRings + 1)) * 100);
      ctx.fillText(`${rangeVal}`, cx + r + 2, cy);
      ctx.restore();
    }
  }

  // Outer boundary ring
  ctx.strokeStyle = colors.border + "60";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, usableRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Crosshair lines (N-S, E-W)
  ctx.strokeStyle = colors.border + "30";
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - usableRadius);
  ctx.lineTo(cx, cy + usableRadius);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - usableRadius, cy);
  ctx.lineTo(cx + usableRadius, cy);
  ctx.stroke();

  // Compass labels
  if (compassLabels) {
    ctx.fillStyle = colors.textDim;
    ctx.font = "8px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", cx, cy - usableRadius - 6);
    ctx.fillText("S", cx, cy + usableRadius + 6);
    ctx.fillText("E", cx + usableRadius + 6, cy);
    ctx.fillText("W", cx - usableRadius - 6, cy);
  }

  // Sweep wedge -- pie sector with gradient alpha
  const sweepWidth = degToRad(30);
  const trailingEdge = sweepAngle - sweepWidth;
  const steps = 12;

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const startA = trailingEdge + t * sweepWidth;
    const endA = trailingEdge + (t + 1) * sweepWidth;
    const alpha = t * 0.4; // fade from 0 at trailing to ~0.4 at leading

    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, usableRadius, startA, endA);
    ctx.closePath();
    ctx.fill();
  }

  // Bright leading edge line
  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = colors.primaryBright;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.cos(sweepAngle) * usableRadius,
    cy + Math.sin(sweepAngle) * usableRadius,
  );
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Target blips
  for (const target of targets) {
    const contactTime = blipTimes.get(target.id);
    if (contactTime === undefined) continue;

    const elapsed = now - contactTime;
    if (elapsed > blipDecayMs) continue;

    const opacity = Math.max(0, 1 - elapsed / blipDecayMs);

    // Convert target position to canvas coordinates
    // angle: 0 = north (up), clockwise. Canvas: 0 = right.
    const targetRad = degToRad(target.angle) - Math.PI / 2;
    const dist = target.range * usableRadius;
    const tx = cx + Math.cos(targetRad) * dist;
    const ty = cy + Math.sin(targetRad) * dist;

    // Determine blip color
    let blipColor: string;
    if (target.type === "friendly") {
      blipColor = colors.primary;
    } else {
      blipColor = TARGET_COLORS[target.type];
    }

    // Draw diamond (rotated square)
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = blipColor;
    ctx.shadowColor = blipColor;
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(tx, ty - BLIP_HALF);
    ctx.lineTo(tx + BLIP_HALF, ty);
    ctx.lineTo(tx, ty + BLIP_HALF);
    ctx.lineTo(tx - BLIP_HALF, ty);
    ctx.closePath();
    ctx.fill();

    // Label
    if (target.label) {
      ctx.shadowBlur = 0;
      ctx.font = "7px monospace";
      ctx.fillStyle = blipColor;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(target.label, tx + BLIP_HALF + 3, ty);
    }

    ctx.restore();
  }

  // Center pip
  ctx.fillStyle = colors.primary;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
