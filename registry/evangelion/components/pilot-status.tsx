import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { SyncGauge } from "./sync-gauge";
import { WaveformDisplay } from "./waveform-display";
import { ProgressBar } from "./progress-bar";
import { NumberRoll } from "../primitives/number-roll";
import { GlowText } from "../primitives/glow-text";
import { t, commonLabels } from "../lib/i18n";

export type PilotConnectionStatus = "connected" | "standby" | "disconnected";

export interface PilotData {
  name: string;
  designation: string;
  syncRate: number;
  heartRate: number;
  neuralLink: number;
  plugDepth: number;
  contamination: number;
  status: PilotConnectionStatus;
}

export interface PilotStatusProps {
  pilot: PilotData;
  compact?: boolean;
  className?: string;
}

export function PilotStatus({
  pilot,
  compact = false,
  className,
}: PilotStatusProps) {
  const [expanded, setExpanded] = useState(!compact);
  const { locale, reducedMotion } = useEva();

  const isDisconnected = pilot.status === "disconnected";

  return (
    <motion.div
      layout={!reducedMotion}
      className={cn(
        "border border-eva-border bg-eva-bg font-mono",
        isDisconnected && "opacity-50",
        className,
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b border-eva-border px-3 py-2"
        onClick={compact ? () => setExpanded((e) => !e) : undefined}
        role={compact ? "button" : undefined}
        tabIndex={compact ? 0 : undefined}
        onKeyDown={
          compact
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setExpanded((v) => !v);
                }
              }
            : undefined
        }
      >
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2",
              pilot.status === "connected" && "bg-eva-primary animate-[eva-pulse_2s_ease-in-out_infinite]",
              pilot.status === "standby" && "bg-eva-text-dim",
              pilot.status === "disconnected" && "bg-red-500",
            )}
          />
          <GlowText className="text-sm tracking-wider" intensity="low">
            {pilot.designation}
          </GlowText>
          <span className="text-xs text-eva-text-dim">{pilot.name}</span>
        </div>
        {compact && (
          <span className="text-xs text-eva-text-dim">
            {expanded ? "[-]" : "[+]"}
          </span>
        )}
      </div>

      {/* Compact sync rate always visible */}
      {!expanded && (
        <div className="flex items-center justify-center p-3">
          <NumberRoll value={pilot.syncRate} precision={1} suffix="%" className="text-2xl" />
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={compact ? { height: 0, opacity: 0 } : false}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 p-3">
              {/* Sync Gauge */}
              <div className="col-span-2 flex justify-center">
                <SyncGauge
                  value={pilot.syncRate}
                  pilotName={pilot.name}
                  size={120}
                />
              </div>

              {/* Heart Rate Waveform */}
              <div className="col-span-2">
                <WaveformDisplay
                  type={isDisconnected ? "flat" : "heartbeat"}
                  label={t(commonLabels, "heartRate", locale)}
                  width={240}
                  height={50}
                  speed={pilot.heartRate / 60}
                />
              </div>

              {/* Neural Link */}
              <ProgressBar
                value={pilot.neuralLink}
                label={t(commonLabels, "neuralLink", locale)}
                segments={10}
                className="col-span-1"
              />

              {/* Plug Depth */}
              <div className="flex flex-col gap-0.5">
                <GlowText className="text-[10px] uppercase tracking-widest" intensity="low">
                  {t(commonLabels, "depth", locale)}
                </GlowText>
                <NumberRoll value={pilot.plugDepth} precision={1} suffix="m" className="text-sm" />
              </div>

              {/* Contamination */}
              <ProgressBar
                value={pilot.contamination}
                label={t(commonLabels, "contamination", locale)}
                segments={10}
                className="col-span-2"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
