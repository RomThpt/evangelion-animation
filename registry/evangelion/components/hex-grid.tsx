import { useRef, useEffect, useCallback } from "react";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { DURATION, STAGGER } from "../lib/animation-presets";

export type HexCellStatus = "active" | "inactive" | "warning" | "critical" | "offline";

export interface HexCell {
  id: string;
  status: HexCellStatus;
  value?: number;
  color?: string;
  label?: string;
}

export interface HexGridProps {
  rows: number;
  cols: number;
  cells: HexCell[];
  onCellClick?: (cell: HexCell) => void;
  cellSize?: number;
  className?: string;
}

const statusFills: Record<HexCellStatus, string> = {
  active: "var(--eva-primary)",
  inactive: "var(--eva-surface)",
  warning: "var(--eva-secondary)",
  critical: "#ff1744",
  offline: "var(--eva-bg)",
};

function hexPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return points.join(" ");
}

export function HexGrid({
  rows,
  cols,
  cells,
  onCellClick,
  cellSize = 24,
  className,
}: HexGridProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { reducedMotion } = useEva();

  const cellMap = new Map(cells.map((c) => [c.id, c]));

  const hexWidth = cellSize * Math.sqrt(3);
  const hexHeight = cellSize * 2;
  const svgWidth = cols * hexWidth + hexWidth / 2;
  const svgHeight = rows * hexHeight * 0.75 + hexHeight * 0.25;

  useEffect(() => {
    if (!svgRef.current || reducedMotion) return;

    const hexes = svgRef.current.querySelectorAll("[data-hex]");
    const scope = createScope({ root: svgRef.current });

    scope.add(() => {
      animate(hexes, {
        opacity: [0, 1],
        scale: [0.5, 1],
        delay: stagger(STAGGER.grid, {
          grid: [cols, rows],
          from: "center",
        }),
        duration: DURATION.boot,
        ease: "out(3)",
      });
    });

    return () => scope.revert();
  }, [rows, cols, reducedMotion]);

  const handleClick = useCallback(
    (cellId: string) => {
      const cell = cellMap.get(cellId);
      if (cell && onCellClick) onCellClick(cell);
    },
    [cellMap, onCellClick],
  );

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      width={svgWidth}
      height={svgHeight}
      className={cn("font-mono", className)}
    >
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const cellId = `${row}-${col}`;
          const cell = cellMap.get(cellId);
          const cx = col * hexWidth + (row % 2 === 1 ? hexWidth / 2 : 0) + cellSize;
          const cy = row * hexHeight * 0.75 + cellSize;
          const fill = cell?.color ?? statusFills[cell?.status ?? "inactive"];

          return (
            <g
              key={cellId}
              data-hex
              onClick={() => handleClick(cellId)}
              className="cursor-pointer"
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              <polygon
                points={hexPoints(cx, cy, cellSize * 0.9)}
                fill={fill}
                stroke="var(--eva-border)"
                strokeWidth="1"
                opacity={cell?.status === "active" ? 0.9 : 0.3}
              />
              {cell?.status === "active" && (
                <polygon
                  points={hexPoints(cx, cy, cellSize * 0.9)}
                  fill="none"
                  stroke="var(--eva-primary)"
                  strokeWidth="1"
                  className="animate-[eva-breathing_3s_ease-in-out_infinite]"
                  style={{ filter: "drop-shadow(0 0 3px var(--eva-glow))" }}
                />
              )}
              {cell?.label && (
                <text
                  x={cx}
                  y={cy + 3}
                  textAnchor="middle"
                  fill="var(--eva-text)"
                  fontSize="8"
                  fontFamily="var(--eva-font-mono)"
                >
                  {cell.label}
                </text>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}
