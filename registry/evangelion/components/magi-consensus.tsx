import { useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { Flicker } from "../primitives/flicker";
import { Scanlines } from "../primitives/scanlines";
import { formatLabel, tDual, commonLabels, formatHex } from "../lib/i18n";
import { DURATION, EASING, STAGGER } from "../lib/animation-presets";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type MagiVote = "approve" | "deny" | "abstain" | "processing";

export interface MagiNode {
  name: string;
  designation: string;
  vote: MagiVote;
  confidence: number;
}

export type MagiConsensusResult = "unanimous" | "majority" | "split" | "pending";

export interface MagiConsensusProps {
  nodes: MagiNode[];
  consensus?: MagiConsensusResult;
  booting?: boolean;
  label?: string;
  labelJa?: string;
  onConsensusReached?: (result: MagiConsensusResult) => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const VOTE_COLORS: Record<MagiVote, string> = {
  approve: "var(--eva-primary)",
  deny: "#ff1744",
  abstain: "var(--eva-text-dim)",
  processing: "#ff9100",
};

const VOTE_GLOW: Record<MagiVote, string> = {
  approve: "var(--eva-glow)",
  deny: "rgba(255, 23, 68, 0.5)",
  abstain: "transparent",
  processing: "rgba(255, 145, 0, 0.4)",
};

const CONSENSUS_COLORS: Record<MagiConsensusResult, string> = {
  unanimous: "var(--eva-primary)",
  majority: "#ff9100",
  split: "#ff1744",
  pending: "var(--eva-text-dim)",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function voteIcon(vote: MagiVote): string {
  switch (vote) {
    case "approve":
      return "\u25B2"; // filled triangle up
    case "deny":
      return "\u25BC"; // filled triangle down
    case "abstain":
      return "\u25C6"; // filled diamond
    case "processing":
      return "\u25A0"; // filled square
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MagiConsensus({
  nodes,
  consensus = "pending",
  booting = false,
  label,
  labelJa,
  onConsensusReached,
  className,
}: MagiConsensusProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { locale, reducedMotion } = useEva();
  const prevConsensus = useRef<MagiConsensusResult>(consensus);

  const magiLabels = tDual(commonLabels, "magi");
  const consensusLabels = tDual(commonLabels, "magiConsensus");
  const headerText = label ?? magiLabels.en;
  const headerJa = labelJa ?? magiLabels.ja;

  const displayHeader = formatLabel(headerText, locale, headerJa);

  /* Node address map for visual detail */
  const nodeAddresses = useMemo(
    () => nodes.map((_, i) => formatHex(0x7e00 + i * 0x100)),
    [nodes.length],
  );

  /* ---- Boot animation ---- */
  useEffect(() => {
    if (!containerRef.current || reducedMotion) return;

    const scope = createScope({ root: containerRef.current });
    scope.add(() => {
      animate("[data-magi-node]", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(STAGGER.boot * 8),
        duration: DURATION.boot,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [reducedMotion]);

  /* ---- SVG connection line animation ---- */
  useEffect(() => {
    if (!svgRef.current || reducedMotion) return;

    const lines = svgRef.current.querySelectorAll("[data-magi-line]");
    const scope = createScope({ root: svgRef.current });

    scope.add(() => {
      animate(lines, {
        strokeDashoffset: [100, 0],
        opacity: [0, 1],
        delay: stagger(STAGGER.cascade),
        duration: DURATION.boot * 0.8,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [reducedMotion]);

  /* ---- Consensus callback ---- */
  useEffect(() => {
    if (consensus !== "pending" && prevConsensus.current !== consensus) {
      onConsensusReached?.(consensus);
    }
    prevConsensus.current = consensus;
  }, [consensus, onConsensusReached]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative font-mono",
        className,
      )}
    >
      {/* Header bar */}
      <div className="mb-2 flex items-center gap-3 border-b border-eva-border px-2 pb-1.5">
        <Flicker intensity="subtle">
          <div
            className="h-1.5 w-1.5"
            style={{
              backgroundColor: consensus === "pending" ? "#ff9100" : "var(--eva-primary)",
              boxShadow: `0 0 4px ${consensus === "pending" ? "rgba(255,145,0,0.6)" : "var(--eva-glow)"}`,
            }}
          />
        </Flicker>
        <TypeWriter
          text={displayHeader}
          className="eva-label text-[10px] tracking-widest"
          speed={25}
          cursor={false}
          jitter
        />
        <span className="ml-auto text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
          {formatLabel(
            consensusLabels.en,
            locale,
            consensusLabels.ja !== "magiConsensus" ? consensusLabels.ja : undefined,
          )}
        </span>
      </div>

      {/* SVG connection lines -- drawn between nodes */}
      {nodes.length > 1 && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {nodes.slice(0, -1).map((_, i) => {
            /* horizontal lines between node centers */
            const total = nodes.length;
            const gapFraction = 1 / total;
            const x1Pct = (i + 0.5) * gapFraction * 100 + gapFraction * 50;
            const x2Pct = (i + 1 + 0.5) * gapFraction * 100 - gapFraction * 50;
            return (
              <line
                key={i}
                data-magi-line
                x1={`${x1Pct}%`}
                y1="50%"
                x2={`${x2Pct}%`}
                y2="50%"
                stroke="var(--eva-border)"
                strokeWidth="1"
                strokeDasharray="100"
                strokeDashoffset="100"
                opacity="0"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
      )}

      {/* Node boxes */}
      <div className="flex gap-2">
        {nodes.map((node, i) => {
          const isProcessing = node.vote === "processing";
          const borderColor = VOTE_COLORS[node.vote];
          const glowColor = VOTE_GLOW[node.vote];
          const voteLabel = tDual(commonLabels, node.vote);

          return (
            <div
              key={node.name}
              data-magi-node
              className={cn(
                "eva-clip-corner relative flex-1 border bg-[var(--eva-surface)] p-2",
                booting && "opacity-0",
              )}
              style={{
                borderColor,
                boxShadow: `0 0 8px ${glowColor}, inset 0 0 12px rgba(0,0,0,0.4)`,
              }}
            >
              {/* Designation (Japanese subtitle) */}
              <div className="mb-1 text-center text-[9px] tracking-[0.2em] text-[var(--eva-text-muted,var(--eva-text-dim))]">
                {node.designation}
              </div>

              {/* Node name */}
              <div
                className="mb-1.5 text-center text-[11px] font-bold tracking-wider"
                style={{
                  color: borderColor,
                  textShadow: `0 0 4px ${glowColor}`,
                }}
              >
                {node.name}
              </div>

              {/* Memory address decoration */}
              <div className="mb-2 text-center text-[8px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
                {nodeAddresses[i]}
              </div>

              {/* Divider */}
              <div
                className="mx-auto mb-2 h-px w-3/4"
                style={{ backgroundColor: borderColor, opacity: 0.4 }}
              />

              {/* Vote status */}
              <div className="mb-1.5 flex items-center justify-center gap-1.5">
                <span
                  className="text-sm"
                  style={{
                    color: borderColor,
                    filter: `drop-shadow(0 0 2px ${glowColor})`,
                  }}
                >
                  {voteIcon(node.vote)}
                </span>
                {isProcessing ? (
                  <Flicker intensity="moderate">
                    <span
                      className="animate-[eva-blink-hard_1.2s_steps(1)_infinite] text-[10px] font-bold tracking-wider"
                      style={{ color: borderColor }}
                    >
                      {formatLabel(
                        voteLabel.en,
                        locale,
                        voteLabel.ja !== node.vote ? voteLabel.ja : undefined,
                      )}
                    </span>
                  </Flicker>
                ) : (
                  <GlowText
                    className="text-[10px] font-bold tracking-wider"
                    intensity={node.vote === "approve" ? "medium" : "low"}
                  >
                    <span style={{ color: borderColor }}>
                      {formatLabel(
                        voteLabel.en,
                        locale,
                        voteLabel.ja !== node.vote ? voteLabel.ja : undefined,
                      )}
                    </span>
                  </GlowText>
                )}
              </div>

              {/* Confidence readout */}
              <div className="flex items-center justify-center gap-1">
                <span className="text-[8px] tracking-wider text-[var(--eva-text-muted,var(--eva-text-dim))]">
                  {formatLabel(
                    tDual(commonLabels, "confidence").en,
                    locale,
                    tDual(commonLabels, "confidence").ja,
                  )}
                </span>
                <NumberRoll
                  value={node.confidence}
                  precision={1}
                  suffix="%"
                  className="text-[10px]"
                />
              </div>

              {/* Subtle corner bracket decorations */}
              <div
                className="pointer-events-none absolute left-1 top-1 h-2 w-2 border-l border-t"
                style={{ borderColor, opacity: 0.5 }}
              />
              <div
                className="pointer-events-none absolute bottom-1 right-1 h-2 w-2 border-b border-r"
                style={{ borderColor, opacity: 0.5 }}
              />

              <Scanlines intensity="subtle" />
            </div>
          );
        })}
      </div>

      {/* Consensus result */}
      <div className="mt-2 border-t border-eva-border pt-1.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={consensus}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeOut" }}
            className="flex items-center justify-center gap-2"
          >
            {/* Result indicator pip */}
            <div
              className="h-1.5 w-6"
              style={{
                backgroundColor: CONSENSUS_COLORS[consensus],
                boxShadow: `0 0 6px ${CONSENSUS_COLORS[consensus]}`,
              }}
            />

            {/* Result text */}
            <GlowText
              className="text-xs tracking-[0.25em]"
              intensity={consensus === "unanimous" ? "high" : "medium"}
              pulse={consensus === "pending"}
            >
              <span style={{ color: CONSENSUS_COLORS[consensus] }}>
                {formatLabel(
                  tDual(commonLabels, consensus).en,
                  locale,
                  tDual(commonLabels, consensus).ja !== consensus
                    ? tDual(commonLabels, consensus).ja
                    : undefined,
                )}
              </span>
            </GlowText>

            <div
              className="h-1.5 w-6"
              style={{
                backgroundColor: CONSENSUS_COLORS[consensus],
                boxShadow: `0 0 6px ${CONSENSUS_COLORS[consensus]}`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
