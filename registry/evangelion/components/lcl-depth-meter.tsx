import { useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { getCanvasColors } from "../provider/themes";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { Flicker } from "../primitives/flicker";
import { formatLabel, tDual, commonLabels } from "../lib/i18n";
import { DURATION, EASING } from "../lib/animation-presets";

export interface LCLDepthMeterProps {
  level: number;
  pressure?: number;
  pressureUnit?: string;
  contamination?: number;
  label?: string;
  labelJa?: string;
  maxDepth?: number;
  depthUnit?: string;
  tickCount?: number;
  onContaminationAlert?: () => void;
  className?: string;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  wobblePhase: number;
  opacity: number;
}

const GAUGE_WIDTH = 80;
const GAUGE_HEIGHT = 256;
const BUBBLE_COUNT = 15;
const WAVE_AMPLITUDE = 2;
const WAVE_FREQUENCY = 0.08;
const CONTAMINATION_THRESHOLD = 70;

export function LCLDepthMeter({
  level,
  pressure,
  pressureUnit = "kPa",
  contamination,
  label,
  labelJa,
  maxDepth = 100,
  depthUnit = "m",
  tickCount = 10,
  onContaminationAlert,
  className,
}: LCLDepthMeterProps) {
  const fluidRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ticksRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const prevContaminationRef = useRef(contamination);

  const { palette, locale, reducedMotion } = useEva();
  const colors = getCanvasColors(palette);

  const labels = tDual(commonLabels, "lcl");
  const depthLabels = tDual(commonLabels, "depth");
  const pressureLabels = tDual(commonLabels, "pressure");

  const displayLabel = label
    ? formatLabel(label, locale, labelJa)
    : formatLabel(labels.en, locale, labels.ja);

  const clampedLevel = Math.max(0, Math.min(100, level));

  /* fluid color based on contamination level */
  const fluidColor =
    contamination != null && contamination > CONTAMINATION_THRESHOLD
      ? "#ff174480"
      : contamination != null && contamination > 40
        ? "#ff910040"
        : `${colors.primary}40`;

  /* fire contamination alert when crossing threshold */
  useEffect(() => {
    const prev = prevContaminationRef.current;
    prevContaminationRef.current = contamination;

    if (
      contamination != null &&
      contamination > CONTAMINATION_THRESHOLD &&
      (prev == null || prev <= CONTAMINATION_THRESHOLD)
    ) {
      onContaminationAlert?.();
    }
  }, [contamination, onContaminationAlert]);

  /* animate fluid level with anime.js */
  useEffect(() => {
    if (!fluidRef.current || reducedMotion) {
      if (fluidRef.current) fluidRef.current.style.height = `${clampedLevel}%`;
      return;
    }

    const scope = createScope({ root: fluidRef.current.parentElement! });
    scope.add(() => {
      animate(fluidRef.current!, {
        height: `${clampedLevel}%`,
        duration: 800,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [clampedLevel, reducedMotion]);

  /* stagger tick marks on mount */
  useEffect(() => {
    if (!ticksRef.current || reducedMotion) return;

    const ticks = ticksRef.current.querySelectorAll("[data-tick]");
    const scope = createScope({ root: ticksRef.current });

    scope.add(() => {
      animate(ticks, {
        opacity: [0, 1],
        delay: stagger(40, { from: "last" }),
        duration: DURATION.boot * 0.5,
        ease: "out(2)",
      });
    });

    return () => scope.revert();
  }, [reducedMotion]);

  /* initialize bubbles */
  const initBubbles = useCallback(() => {
    if (bubblesRef.current.length > 0) return;
    bubblesRef.current = Array.from({ length: BUBBLE_COUNT }, () => ({
      x: Math.random() * GAUGE_WIDTH,
      y: Math.random() * GAUGE_HEIGHT,
      r: 1 + Math.random() * 2,
      speed: 8 + Math.random() * 12,
      wobblePhase: Math.random() * Math.PI * 2,
      opacity: 0.3 + Math.random() * 0.5,
    }));
  }, []);

  /* update bubble positions */
  const updateBubbles = useCallback(
    (dt: number) => {
      const fluidTop = GAUGE_HEIGHT * (1 - clampedLevel / 100);
      for (const bubble of bubblesRef.current) {
        bubble.y -= bubble.speed * dt;
        bubble.wobblePhase += dt * 3;
        bubble.x += Math.sin(bubble.wobblePhase) * 0.4;

        /* fade out as bubble approaches the fluid surface */
        const distFromSurface = bubble.y - fluidTop;
        if (distFromSurface < 20) {
          bubble.opacity = Math.max(0, (distFromSurface / 20) * 0.6);
        }

        /* reset bubble to bottom when it reaches surface or goes above */
        if (bubble.y <= fluidTop || bubble.opacity <= 0) {
          bubble.y = GAUGE_HEIGHT - Math.random() * 10;
          bubble.x = Math.random() * GAUGE_WIDTH;
          bubble.r = 1 + Math.random() * 2;
          bubble.speed = 8 + Math.random() * 12;
          bubble.opacity = 0.3 + Math.random() * 0.5;
          bubble.wobblePhase = Math.random() * Math.PI * 2;
        }

        /* clamp x within gauge bounds */
        if (bubble.x < 0) bubble.x = GAUGE_WIDTH;
        if (bubble.x > GAUGE_WIDTH) bubble.x = 0;
      }
    },
    [clampedLevel],
  );

  /* draw bubbles and surface wave onto canvas */
  const drawBubblesAndWave = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      ctx.clearRect(0, 0, GAUGE_WIDTH, GAUGE_HEIGHT);

      const fluidTop = GAUGE_HEIGHT * (1 - clampedLevel / 100);

      /* surface wave at the top of the fluid */
      if (clampedLevel > 0 && clampedLevel < 100) {
        ctx.beginPath();
        ctx.moveTo(0, fluidTop);

        for (let x = 0; x <= GAUGE_WIDTH; x++) {
          const y =
            fluidTop +
            WAVE_AMPLITUDE * Math.sin(x * WAVE_FREQUENCY * Math.PI * 2 + time * 1.5) +
            WAVE_AMPLITUDE * 0.3 * Math.sin(x * WAVE_FREQUENCY * Math.PI * 4 + time * 2.3);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(GAUGE_WIDTH, GAUGE_HEIGHT);
        ctx.lineTo(0, GAUGE_HEIGHT);
        ctx.closePath();

        ctx.fillStyle = `${colors.primary}12`;
        ctx.fill();

        /* wave crest line */
        ctx.beginPath();
        for (let x = 0; x <= GAUGE_WIDTH; x++) {
          const y =
            fluidTop +
            WAVE_AMPLITUDE * Math.sin(x * WAVE_FREQUENCY * Math.PI * 2 + time * 1.5) +
            WAVE_AMPLITUDE * 0.3 * Math.sin(x * WAVE_FREQUENCY * Math.PI * 4 + time * 2.3);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `${colors.primary}60`;
        ctx.lineWidth = 1;
        ctx.shadowColor = colors.glow;
        ctx.shadowBlur = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* draw bubbles within the fluid area */
      for (const bubble of bubblesRef.current) {
        if (bubble.y < fluidTop || bubble.y > GAUGE_HEIGHT) continue;

        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.primaryBright}${Math.round(bubble.opacity * 255)
          .toString(16)
          .padStart(2, "0")}`;
        ctx.fill();

        /* subtle highlight on each bubble */
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.r * 0.3, bubble.y - bubble.r * 0.3, bubble.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.primaryBright}30`;
        ctx.fill();
      }
    },
    [clampedLevel, colors],
  );

  /* canvas rAF loop for bubbles + wave */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = GAUGE_WIDTH * dpr;
    canvas.height = GAUGE_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    initBubbles();

    if (reducedMotion) {
      drawBubblesAndWave(ctx, 0);
      return;
    }

    let lastTime = 0;

    const render = (time: number) => {
      const dt = lastTime ? (time - lastTime) / 1000 : 0.016;
      lastTime = time;
      updateBubbles(dt);
      drawBubblesAndWave(ctx, time / 1000);
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reducedMotion, initBubbles, updateBubbles, drawBubblesAndWave]);

  /* tick mark y positions */
  const tickPositions = Array.from({ length: tickCount }, (_, i) => {
    const y = (i / (tickCount - 1)) * GAUGE_HEIGHT;
    return y;
  });

  return (
    <div className={cn("inline-flex flex-col items-center font-mono", className)}>
      {/* label */}
      <span className="eva-label mb-1 text-[8px]">{displayLabel}</span>

      {/* gauge container */}
      <div className="relative h-64 w-20 border border-eva-border bg-[var(--eva-bg)] overflow-hidden">
        {/* SVG tick marks on left side */}
        <svg
          ref={ticksRef}
          className="absolute inset-y-0 left-0 w-3"
          viewBox={`0 0 12 ${GAUGE_HEIGHT}`}
          preserveAspectRatio="none"
        >
          {tickPositions.map((y, i) => (
            <line
              data-tick
              key={i}
              x1="0"
              y1={y}
              x2="8"
              y2={y}
              stroke={colors.border}
              strokeWidth="1"
              opacity="0"
            />
          ))}
        </svg>

        {/* fluid fill from bottom */}
        <div
          ref={fluidRef}
          className="absolute bottom-0 left-0 right-0 transition-colors duration-1000"
          style={{
            height: `${clampedLevel}%`,
            background: fluidColor,
          }}
        />

        {/* bubbles + wave canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: GAUGE_WIDTH, height: GAUGE_HEIGHT }}
        />

        {/* contamination warning overlay */}
        <AnimatePresence>
          {contamination != null && contamination > CONTAMINATION_THRESHOLD && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
              className="absolute inset-0 flex items-center justify-center bg-[rgba(255,0,0,0.1)]"
            >
              <Flicker intensity="heavy">
                <GlowText
                  className="text-[9px] font-bold tracking-[0.2em]"
                  pulse
                  intensity="high"
                >
                  <span className="[writing-mode:vertical-rl]" style={{ color: "#ff1744" }}>
                    CONTAMINATION
                  </span>
                </GlowText>
              </Flicker>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* depth readout */}
      <div className="mt-1 text-center">
        <div className="text-[7px] text-eva-text-dim mb-0.5">
          {formatLabel(depthLabels.en, locale, depthLabels.ja)}
        </div>
        <NumberRoll
          value={(clampedLevel / 100) * maxDepth}
          precision={1}
          suffix={depthUnit}
          className="text-xs"
        />
      </div>

      {/* pressure readout */}
      {pressure != null && (
        <div className="mt-0.5 text-[8px] text-eva-text-dim">
          {formatLabel(pressureLabels.en, locale, pressureLabels.ja)}: {pressure}
          <span className="ml-[0.15em] text-[0.85em]">{pressureUnit}</span>
        </div>
      )}
    </div>
  );
}
