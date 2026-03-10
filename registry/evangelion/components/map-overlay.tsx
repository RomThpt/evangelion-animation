import { useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { getCanvasColors } from "../provider/themes";
import { GlowText } from "../primitives/glow-text";

export type MarkerType = "friendly" | "hostile" | "unknown" | "poi";

export interface MapMarker {
  id: string;
  position: { x: number; y: number };
  type: MarkerType;
  label?: string;
  status?: string;
}

export interface RangeCircle {
  radius: number;
  label?: string;
}

export interface MapOverlayProps {
  center?: { x: number; y: number };
  zoom?: number;
  markers?: MapMarker[];
  rangeCircles?: RangeCircle[];
  gridDensity?: number;
  width?: number;
  height?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

const markerColors: Record<MarkerType, string> = {
  friendly: "#00ff41",
  hostile: "#ff1744",
  unknown: "#ff9100",
  poi: "#00e5ff",
};

export function MapOverlay({
  center = { x: 0, y: 0 },
  zoom = 1,
  markers = [],
  rangeCircles = [],
  gridDensity = 40,
  width = 400,
  height = 300,
  onMarkerClick,
  className,
}: MapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const { palette, reducedMotion } = useEva();

  const colors = getCanvasColors(palette);
  const cx = width / 2;
  const cy = height / 2;

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = `${colors.border}40`;
      ctx.lineWidth = 0.5;

      const spacing = gridDensity * zoom;
      const offsetX = (center.x * zoom) % spacing;
      const offsetY = (center.y * zoom) % spacing;

      for (let x = -offsetX; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -offsetY; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    [width, height, gridDensity, zoom, center, colors.border],
  );

  const drawRangeCircles = useCallback(
    (ctx: CanvasRenderingContext2D, t: number) => {
      rangeCircles.forEach((rc) => {
        const r = rc.radius * zoom;
        const pulse = reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(t * 0.5);

        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3 + pulse * 0.2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        if (rc.label) {
          ctx.fillStyle = colors.textDim;
          ctx.font = "10px 'Share Tech Mono', monospace";
          ctx.fillText(rc.label, cx + r + 4, cy);
        }
      });
    },
    [rangeCircles, zoom, cx, cy, colors, reducedMotion],
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

    const draw = () => {
      timeRef.current += 0.016;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      drawGrid(ctx);
      drawRangeCircles(ctx, timeRef.current);

      // Center crosshair
      ctx.strokeStyle = `${colors.primary}50`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();

      if (!reducedMotion) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
    if (reducedMotion) return;

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, colors, drawGrid, drawRangeCircles, cx, cy, reducedMotion]);

  return (
    <div className={cn("relative inline-block font-mono", className)}>
      <div className="border border-eva-border">
        <canvas
          ref={canvasRef}
          style={{ width, height }}
          className="block"
        />
      </div>

      {/* DOM markers overlaid on canvas */}
      {markers.map((marker) => {
        const mx = cx + (marker.position.x - center.x) * zoom;
        const my = cy + (marker.position.y - center.y) * zoom;

        if (mx < 0 || mx > width || my < 0 || my > height) return null;

        return (
          <motion.div
            key={marker.id}
            className="absolute cursor-pointer"
            style={{ left: mx - 6, top: my - 6 }}
            onClick={() => onMarkerClick?.(marker)}
            whileHover={{ scale: 1.3 }}
          >
            <div
              className={cn(
                "h-3 w-3 rotate-45 border",
                marker.type === "hostile" && "animate-[eva-pulse_1s_steps(1)_infinite]",
              )}
              style={{
                borderColor: markerColors[marker.type],
                backgroundColor: `${markerColors[marker.type]}40`,
              }}
            />
            {marker.label && (
              <GlowText
                className="absolute left-4 top-0 whitespace-nowrap text-[9px]"
                intensity="low"
              >
                <span style={{ color: markerColors[marker.type] }}>
                  {marker.label}
                </span>
              </GlowText>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
