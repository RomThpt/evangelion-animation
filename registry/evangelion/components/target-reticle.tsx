import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { DURATION, EASING } from "../lib/animation-presets";

export interface TargetReticleProps {
  locked?: boolean;
  targetName?: string;
  distance?: number;
  angle?: number;
  size?: number;
  onToggleLock?: () => void;
  className?: string;
}

export function TargetReticle({
  locked = false,
  targetName,
  distance = 0,
  angle = 0,
  size = 200,
  onToggleLock,
  className,
}: TargetReticleProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { reducedMotion } = useEva();
  const center = size / 2;
  const outerR = size / 2 - 8;
  const innerR = outerR * 0.6;
  const lockR = outerR * 0.35;

  useEffect(() => {
    if (!svgRef.current || reducedMotion || !locked) return;

    const rings = svgRef.current.querySelectorAll("[data-lock-ring]");
    const scope = createScope({ root: svgRef.current });

    scope.add(() => {
      animate(rings, {
        r: [outerR, lockR],
        opacity: [0.3, 1],
        duration: DURATION.boot * 0.6,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [locked, outerR, lockR, reducedMotion]);

  return (
    <motion.div
      className={cn("relative inline-block font-mono", className)}
      drag={!locked}
      dragMomentum={false}
      whileDrag={{ scale: 1.05 }}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onClick={onToggleLock}
        className="cursor-pointer"
      >
        {/* Outer rotating ring */}
        <circle
          cx={center}
          cy={center}
          r={outerR}
          fill="none"
          stroke="var(--eva-border)"
          strokeWidth="1"
          strokeDasharray="8 4"
          className={!reducedMotion ? "animate-[spin_8s_linear_infinite]" : ""}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Inner ring */}
        <circle
          cx={center}
          cy={center}
          r={innerR}
          fill="none"
          stroke="var(--eva-primary)"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Lock rings (animate on lock) */}
        {locked && (
          <>
            <circle
              data-lock-ring
              cx={center}
              cy={center}
              r={lockR}
              fill="none"
              stroke="var(--eva-primary)"
              strokeWidth="2"
              style={{ filter: "drop-shadow(0 0 4px var(--eva-glow))" }}
            />
            <circle
              data-lock-ring
              cx={center}
              cy={center}
              r={lockR * 1.2}
              fill="none"
              stroke="var(--eva-primary)"
              strokeWidth="1"
              opacity="0.5"
            />
          </>
        )}

        {/* Crosshairs */}
        <line
          x1={center - outerR}
          y1={center}
          x2={center - innerR * 0.5}
          y2={center}
          stroke="var(--eva-primary)"
          strokeWidth="1"
        />
        <line
          x1={center + innerR * 0.5}
          y1={center}
          x2={center + outerR}
          y2={center}
          stroke="var(--eva-primary)"
          strokeWidth="1"
        />
        <line
          x1={center}
          y1={center - outerR}
          x2={center}
          y2={center - innerR * 0.5}
          stroke="var(--eva-primary)"
          strokeWidth="1"
        />
        <line
          x1={center}
          y1={center + innerR * 0.5}
          x2={center}
          y2={center + outerR}
          stroke="var(--eva-primary)"
          strokeWidth="1"
        />

        {/* Corner brackets */}
        {[
          [12, 12],
          [size - 12, 12],
          [12, size - 12],
          [size - 12, size - 12],
        ].map(([bx, by], i) => {
          const dx = bx < center ? 1 : -1;
          const dy = by < center ? 1 : -1;
          return (
            <path
              key={i}
              d={`M${bx + dx * 12},${by} L${bx},${by} L${bx},${by + dy * 12}`}
              fill="none"
              stroke={locked ? "var(--eva-primary)" : "var(--eva-border)"}
              strokeWidth="2"
            />
          );
        })}

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={2}
          fill={locked ? "var(--eva-primary)" : "var(--eva-text-dim)"}
        />
      </svg>

      {/* Info readouts */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px]">
        {targetName && (
          <GlowText intensity="low" className="text-[10px]">
            {targetName}
          </GlowText>
        )}
        <span className="text-eva-text-dim">
          <NumberRoll value={angle} precision={0} className="text-[10px]" />deg{" "}
          <NumberRoll value={distance} precision={0} className="text-[10px]" />m
        </span>
      </div>

      {locked && (
        <div className="absolute left-1/2 top-1 -translate-x-1/2">
          <GlowText
            className="text-[10px] tracking-widest"
            pulse
            intensity="high"
          >
            LOCKED
          </GlowText>
        </div>
      )}
    </motion.div>
  );
}
