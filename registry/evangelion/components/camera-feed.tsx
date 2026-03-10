import { useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { GlowText } from "../primitives/glow-text";
import { Flicker } from "../primitives/flicker";
import { TypeWriter } from "../primitives/type-writer";
import { Scanlines } from "../primitives/scanlines";
import { formatLabel, formatHex } from "../lib/i18n";
import { DURATION, EASING } from "../lib/animation-presets";

export type CameraStatus = "live" | "offline" | "recording" | "paused";

export interface CameraFeedProps {
  cameraId?: string;
  label?: string;
  labelJa?: string;
  status?: CameraStatus;
  signalStrength?: number;
  children?: ReactNode;
  src?: string;
  timestamp?: string;
  showCornerBrackets?: boolean;
  className?: string;
}

function drawNoise(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 60;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}

export function CameraFeed({
  cameraId = "0",
  label,
  labelJa,
  status = "live",
  signalStrength = 100,
  children,
  src,
  timestamp,
  showCornerBrackets = true,
  className,
}: CameraFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const bracketsRef = useRef<SVGSVGElement>(null);
  const { locale, reducedMotion } = useEva();

  /* --- canvas noise when offline --- */
  useEffect(() => {
    if (status !== "offline") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 320 * dpr;
    canvas.height = 240 * dpr;
    ctx.scale(dpr, dpr);

    if (reducedMotion) {
      drawNoise(ctx, 320, 240);
      return;
    }

    let frame = 0;
    const render = () => {
      frame++;
      if (frame % 4 === 0) drawNoise(ctx, 320, 240);
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, reducedMotion]);

  /* --- corner bracket animation --- */
  useEffect(() => {
    if (!bracketsRef.current || reducedMotion || !showCornerBrackets) return;
    const lines = bracketsRef.current.querySelectorAll("[data-bracket]");
    const scope = createScope({ root: bracketsRef.current });

    scope.add(() => {
      animate(lines, {
        strokeDashoffset: [40, 0],
        delay: stagger(80),
        duration: DURATION.boot * 0.6,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [showCornerBrackets, reducedMotion]);

  const filledBars = Math.round((Math.max(0, Math.min(100, signalStrength)) / 100) * 5);

  const cameraHex = formatHex(parseInt(cameraId, 10) || 0);
  const headerLabel = label
    ? formatLabel(label, locale, labelJa)
    : formatLabel("CAMERA", locale, "\u30AB\u30E1\u30E9");

  return (
    <div
      className={cn(
        "relative overflow-hidden border border-eva-border bg-black font-mono",
        className,
      )}
    >
      {/* Header label */}
      <div className="flex items-center justify-between border-b border-eva-border px-2 py-0.5 text-[9px] text-eva-text-dim">
        <span>{headerLabel}</span>
        <span>{cameraHex}</span>
      </div>

      {/* Feed area */}
      <div className="relative aspect-video">
        {/* Image or children when live/recording */}
        {(status === "live" || status === "recording") && (
          <>
            {src ? (
              <img
                src={src}
                alt={`Camera ${cameraId}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : children ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {children}
              </div>
            ) : null}
          </>
        )}

        {/* Canvas noise when offline */}
        {status === "offline" && (
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%" }}
            className="absolute inset-0 block"
          />
        )}

        {/* Paused state -- dim the feed */}
        {status === "paused" && (
          <div className="absolute inset-0 bg-black/60" />
        )}

        {/* SVG corner brackets */}
        {showCornerBrackets && (
          <svg
            ref={bracketsRef}
            className="pointer-events-none absolute inset-0 z-10 h-full w-full"
            viewBox="0 0 320 240"
            preserveAspectRatio="none"
            fill="none"
          >
            {/* Top-left */}
            <path
              data-bracket
              d="M6,30 L6,6 L30,6"
              stroke="var(--eva-primary)"
              strokeWidth="2"
              strokeDasharray="40"
              strokeDashoffset={reducedMotion ? 0 : 40}
            />
            {/* Top-right */}
            <path
              data-bracket
              d="M290,6 L314,6 L314,30"
              stroke="var(--eva-primary)"
              strokeWidth="2"
              strokeDasharray="40"
              strokeDashoffset={reducedMotion ? 0 : 40}
            />
            {/* Bottom-left */}
            <path
              data-bracket
              d="M6,210 L6,234 L30,234"
              stroke="var(--eva-primary)"
              strokeWidth="2"
              strokeDasharray="40"
              strokeDashoffset={reducedMotion ? 0 : 40}
            />
            {/* Bottom-right */}
            <path
              data-bracket
              d="M314,210 L314,234 L290,234"
              stroke="var(--eva-primary)"
              strokeWidth="2"
              strokeDasharray="40"
              strokeDashoffset={reducedMotion ? 0 : 40}
            />
          </svg>
        )}

        {/* REC indicator */}
        {status === "recording" && (
          <div className="absolute right-2 top-2 z-20 flex items-center gap-1 animate-[eva-blink-hard_1s_steps(1)_infinite]">
            <div
              className="h-2 w-2 rounded-full bg-red-600"
              style={{ boxShadow: "0 0 6px rgba(255,23,68,0.8)" }}
            />
            <span
              className="text-[10px] font-bold tracking-wider"
              style={{ color: "#ff1744" }}
            >
              REC
            </span>
          </div>
        )}

        {/* Status overlays */}
        <AnimatePresence>
          {status === "offline" && (
            <motion.div
              key="no-signal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
            >
              <Flicker intensity="heavy">
                <GlowText intensity="high" className="text-lg tracking-[0.3em]">
                  NO SIGNAL
                </GlowText>
              </Flicker>
            </motion.div>
          )}
          {status === "paused" && (
            <motion.div
              key="paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex items-center justify-center"
            >
              <Flicker intensity="moderate">
                <GlowText intensity="medium" className="text-lg tracking-[0.3em]">
                  PAUSED
                </GlowText>
              </Flicker>
            </motion.div>
          )}
        </AnimatePresence>

        <Scanlines intensity="heavy" />
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between border-t border-eva-border px-2 py-1 text-[9px] text-eva-text-dim">
        <span className="text-eva-text">CAM:{cameraHex}</span>

        {timestamp && (
          <TypeWriter
            text={timestamp}
            speed={25}
            cursor={false}
            jitter
            className="text-[9px]"
          />
        )}

        {/* Signal strength bars */}
        <div className="flex items-end gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-[3px]",
                i < filledBars ? "bg-eva-primary" : "bg-eva-border",
              )}
              style={{
                height: `${4 + i * 2}px`,
                boxShadow: i < filledBars ? "0 0 3px var(--eva-glow-subtle)" : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
