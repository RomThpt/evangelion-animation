import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../../registry/evangelion/provider/eva-provider";
import { AlertOverlay } from "../../registry/evangelion/components/alert-overlay";
import { PatternAlert } from "../../registry/evangelion/components/pattern-alert";
import { CountdownTimer } from "../../registry/evangelion/components/countdown-timer";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import type { EvaPalette } from "../../registry/evangelion/provider/types";

const meta: Meta = {
  title: "Compositions/EmergencySequence",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const AlertCascade: Story = {
  render: () => {
    const [phase, setPhase] = useState<"detect" | "alert" | "countdown">("detect");
    const [palette, setPalette] = useState<EvaPalette>("normal");

    return (
      <EvaProvider palette={palette} locale="ja">
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-eva-bg p-8">
          {phase === "detect" && (
            <PatternAlert
              pattern="blue"
              designation="SACHIEL"
              classification="ANGEL - 3RD"
              confidence={97.3}
              onConfirm={() => {
                setPhase("alert");
                setPalette("emergency");
              }}
            />
          )}

          {phase === "alert" && (
            <AlertOverlay
              level="emergency"
              message="ANGEL APPROACHING TOKYO-3. ALL UNITS SCRAMBLE."
              code="RED-001"
              visible
              onDismiss={() => setPhase("countdown")}
            />
          )}

          {phase === "countdown" && (
            <div className="text-center">
              <GlowText className="mb-4 text-2xl tracking-widest" intensity="high">
                OPERATION START
              </GlowText>
              <CountdownTimer
                targetTime={30}
                format="MM:SS"
                label="INTERCEPT"
                warningThreshold={15}
                criticalThreshold={5}
              />
            </div>
          )}

          {/* Phase controls */}
          <div className="fixed bottom-4 right-4 flex gap-2">
            {(["detect", "alert", "countdown"] as const).map((p) => (
              <button
                key={p}
                className="border border-eva-border px-3 py-1 text-xs text-eva-text-dim"
                onClick={() => {
                  setPhase(p);
                  setPalette(p === "alert" || p === "countdown" ? "emergency" : "normal");
                }}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </EvaProvider>
    );
  },
};
