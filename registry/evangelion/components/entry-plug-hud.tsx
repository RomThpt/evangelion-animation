import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, stagger, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TargetReticle } from "./target-reticle";
import { DataReadout } from "./data-readout";
import { WaveformDisplay } from "./waveform-display";
import { SyncGauge } from "./sync-gauge";
import { Scanlines } from "../primitives/scanlines";
import { GlowText } from "../primitives/glow-text";
import { DURATION, STAGGER } from "../lib/animation-presets";

export interface HUDTarget {
  id: string;
  name: string;
  distance: number;
  locked?: boolean;
}

export interface HUDElements {
  reticle?: boolean;
  sync?: boolean;
  vitals?: boolean;
  comms?: boolean;
  scanlines?: boolean;
}

export interface EntryPlugHUDProps {
  targets?: HUDTarget[];
  syncRate?: number;
  commsActive?: boolean;
  lclLevel?: number;
  hudElements?: HUDElements;
  onTargetClick?: (target: HUDTarget) => void;
  className?: string;
}

const defaultElements: HUDElements = {
  reticle: true,
  sync: true,
  vitals: true,
  comms: true,
  scanlines: true,
};

export function EntryPlugHUD({
  targets = [],
  syncRate = 0,
  commsActive = true,
  lclLevel = 100,
  hudElements = defaultElements,
  onTargetClick,
  className,
}: EntryPlugHUDProps) {
  const hudRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);
  const { reducedMotion } = useEva();

  const elements = { ...defaultElements, ...hudElements };
  const activeTarget = targets.find((t) => t.locked) ?? targets[0];

  // Boot sequence animation
  useEffect(() => {
    if (!hudRef.current || reducedMotion) {
      setBooted(true);
      return;
    }

    const panels = hudRef.current.querySelectorAll("[data-hud-panel]");
    const scope = createScope({ root: hudRef.current });

    scope.add(() => {
      animate(panels, {
        opacity: [0, 1],
        translateY: [30, 0],
        delay: stagger(STAGGER.boot),
        duration: DURATION.boot,
        ease: "out(3)",
        onComplete: () => setBooted(true),
      });
    });

    return () => scope.revert();
  }, [reducedMotion]);

  return (
    <div
      ref={hudRef}
      className={cn(
        "relative h-full w-full overflow-hidden bg-eva-bg font-mono",
        className,
      )}
    >
      {/* Center reticle */}
      {elements.reticle && activeTarget && (
        <div data-hud-panel className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <TargetReticle
            locked={activeTarget.locked}
            targetName={activeTarget.name}
            distance={activeTarget.distance}
            size={240}
            onToggleLock={() => onTargetClick?.(activeTarget)}
          />
        </div>
      )}

      {/* Top-left: Sync gauge */}
      {elements.sync && (
        <div data-hud-panel className="absolute left-4 top-4">
          <SyncGauge value={syncRate} size={100} />
        </div>
      )}

      {/* Top-right: Data readouts */}
      {elements.vitals && (
        <div data-hud-panel className="absolute right-4 top-4 flex flex-col gap-2">
          <DataReadout label="LCL" value={lclLevel} unit="%" trend="stable" />
          <DataReadout
            label="SYNC"
            value={syncRate}
            unit="%"
            trend={syncRate > 50 ? "up" : "down"}
          />
        </div>
      )}

      {/* Bottom-left: Waveform */}
      {elements.vitals && (
        <div data-hud-panel className="absolute bottom-4 left-4">
          <WaveformDisplay
            type="heartbeat"
            label="BIO-SIGNAL"
            width={200}
            height={50}
          />
        </div>
      )}

      {/* Bottom-right: Comms */}
      {elements.comms && (
        <div data-hud-panel className="absolute bottom-4 right-4">
          <AnimatePresence>
            {commsActive ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <GlowText
                  className="text-xs tracking-widest"
                  pulse
                  intensity="low"
                >
                  COMMS ACTIVE
                </GlowText>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-xs tracking-widest text-red-500">
                  COMMS OFFLINE
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Target list */}
      {targets.length > 1 && (
        <div data-hud-panel className="absolute left-4 top-1/2 -translate-y-1/2 space-y-1">
          {targets.map((target) => (
            <button
              key={target.id}
              className={cn(
                "block w-full border px-2 py-0.5 text-left text-[10px]",
                target.locked
                  ? "border-eva-primary text-eva-text"
                  : "border-eva-border text-eva-text-dim",
              )}
              onClick={() => onTargetClick?.(target)}
            >
              {target.name}
            </button>
          ))}
        </div>
      )}

      {/* Boot indicator */}
      {!booted && !reducedMotion && (
        <div className="absolute inset-0 flex items-center justify-center bg-eva-bg">
          <GlowText className="text-xs tracking-[0.3em]" pulse>
            INITIALIZING HUD
          </GlowText>
        </div>
      )}

      {/* Scanlines overlay */}
      {elements.scanlines && <Scanlines />}
    </div>
  );
}
