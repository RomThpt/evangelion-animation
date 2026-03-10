import { useRef, useEffect } from "react";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { DURATION, EASING } from "../lib/animation-presets";

export interface ATFieldSector {
  label: string;
  strength: number;
  integrity: number;
}

export interface ATFieldDiagramProps {
  sectors: ATFieldSector[];
  overallStrength?: number;
  breached?: boolean;
  onSectorClick?: (index: number) => void;
  size?: number;
  className?: string;
}

function octagonPoints(cx: number, cy: number, r: number, rotation = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI / 4) * i + rotation;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

export function ATFieldDiagram({
  sectors,
  overallStrength = 100,
  breached = false,
  onSectorClick,
  size = 240,
  className,
}: ATFieldDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { reducedMotion } = useEva();
  const center = size / 2;
  const maxR = size / 2 - 16;

  const rings = [maxR, maxR * 0.75, maxR * 0.5, maxR * 0.25];

  useEffect(() => {
    if (!svgRef.current || reducedMotion || !breached) return;

    const fragments = svgRef.current.querySelectorAll("[data-breach]");
    const scope = createScope({ root: svgRef.current });

    scope.add(() => {
      animate(fragments, {
        opacity: [1, 0],
        scale: [1, 1.5],
        duration: DURATION.boot,
        ease: EASING.dataChange,
      });
    });

    return () => scope.revert();
  }, [breached, reducedMotion]);

  return (
    <div className={cn("inline-flex flex-col items-center font-mono", className)}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Concentric octagonal rings */}
        {rings.map((r, i) => (
          <polygon
            key={i}
            points={octagonPoints(center, center, r, i % 2 === 0 ? 0 : Math.PI / 8)}
            fill="none"
            stroke="var(--eva-border)"
            strokeWidth="1"
            opacity={0.3 + i * 0.1}
            className={
              !reducedMotion && i < 2
                ? i === 0
                  ? "animate-[spin_20s_linear_infinite]"
                  : "animate-[spin_25s_linear_infinite_reverse]"
                : ""
            }
            style={{ transformOrigin: `${center}px ${center}px` }}
          />
        ))}

        {/* Active field (strength-based) */}
        <polygon
          points={octagonPoints(center, center, maxR * (overallStrength / 100))}
          fill="var(--eva-primary)"
          fillOpacity="0.1"
          stroke="var(--eva-primary)"
          strokeWidth="2"
          className={!reducedMotion ? "animate-[eva-breathing_4s_ease-in-out_infinite]" : ""}
          style={{ filter: "drop-shadow(0 0 6px var(--eva-glow))" }}
        />

        {/* Sector lines */}
        {sectors.map((sector, i) => {
          const angle = (Math.PI * 2 * i) / sectors.length - Math.PI / 2;
          const ex = center + maxR * Math.cos(angle);
          const ey = center + maxR * Math.sin(angle);
          const sectorR = maxR * (sector.strength / 100);

          return (
            <g
              key={i}
              onClick={() => onSectorClick?.(i)}
              className="cursor-pointer"
            >
              <line
                x1={center}
                y1={center}
                x2={ex}
                y2={ey}
                stroke="var(--eva-border)"
                strokeWidth="1"
                opacity="0.5"
              />
              {/* Sector strength indicator */}
              <circle
                cx={center + sectorR * Math.cos(angle)}
                cy={center + sectorR * Math.sin(angle)}
                r={4}
                fill={sector.integrity < 50 ? "var(--eva-secondary)" : "var(--eva-primary)"}
                style={{ filter: "drop-shadow(0 0 3px var(--eva-glow))" }}
              />
              {/* Sector label */}
              <text
                x={center + (maxR + 12) * Math.cos(angle)}
                y={center + (maxR + 12) * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--eva-text-dim)"
                fontSize="8"
                fontFamily="var(--eva-font-mono)"
              >
                {sector.label}
              </text>
            </g>
          );
        })}

        {/* Breach overlay */}
        {breached && (
          <g data-breach style={{ transformOrigin: `${center}px ${center}px` }}>
            <line
              x1={center - maxR * 0.3}
              y1={center - maxR * 0.2}
              x2={center + maxR * 0.1}
              y2={center + maxR * 0.3}
              stroke="#ff1744"
              strokeWidth="3"
            />
            <line
              x1={center + maxR * 0.2}
              y1={center - maxR * 0.3}
              x2={center - maxR * 0.1}
              y2={center + maxR * 0.1}
              stroke="#ff1744"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Center readout */}
        <circle
          cx={center}
          cy={center}
          r={20}
          fill="var(--eva-bg)"
          stroke="var(--eva-border)"
          strokeWidth="1"
        />
      </svg>

      <div className="flex items-center gap-2">
        <GlowText className="text-xs tracking-widest" intensity="low">
          AT FIELD
        </GlowText>
        <NumberRoll
          value={overallStrength}
          precision={0}
          suffix="%"
          className="text-sm"
        />
      </div>
    </div>
  );
}
