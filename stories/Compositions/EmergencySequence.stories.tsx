import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../../registry/evangelion/provider/eva-provider";
import { AlertOverlay } from "../../registry/evangelion/components/alert-overlay";
import { PatternAlert } from "../../registry/evangelion/components/pattern-alert";
import { CountdownTimer } from "../../registry/evangelion/components/countdown-timer";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { Flicker } from "../../registry/evangelion/primitives/flicker";
import { Scanlines } from "../../registry/evangelion/primitives/scanlines";
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
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[var(--eva-bg)] p-8">
          {phase === "detect" && (
            <div className="w-full max-w-md">
              <div className="mb-4 text-center">
                <span className="eva-label text-[8px]">
                  {">>>SENSOR:0x00A3 "}{"\u30BB\u30F3\u30B5\u30FC\u89E3\u6790\u4E2D"}...
                </span>
              </div>
              <PatternAlert
                pattern="blue"
                designation="\u30B5\u30AD\u30A8\u30EB SACHIEL"
                classification="\u4F7F\u5F92 ANGEL -- 3RD"
                confidence={97.3}
                onConfirm={() => {
                  setPhase("alert");
                  setPalette("emergency");
                }}
              />
            </div>
          )}

          {phase === "alert" && (
            <AlertOverlay
              level="emergency"
              message="\u4F7F\u5F92\u63A5\u8FD1\u4E2D -- \u7B2C\u4E09\u65B0\u6771\u4EAC\u5E02\u5185\u3078\u306E\u4FB5\u5165\u78BA\u8A8D\u3002\u5168\u6226\u95D8\u90E8\u968A\u3001\u914D\u7F6E\u306B\u3064\u3051\u3002"
              code="RED-001"
              visible
              onDismiss={() => setPhase("countdown")}
            />
          )}

          {phase === "countdown" && (
            <div className="text-center">
              <Flicker intensity="subtle">
                <GlowText className="mb-2 text-xl tracking-[0.4em]" intensity="high">
                  {"\u4F5C\u6226\u958B\u59CB"} OPERATION START
                </GlowText>
              </Flicker>
              <div className="mt-4">
                <CountdownTimer
                  targetTime={30}
                  format="MM:SS"
                  label="[ \u8FF7\u6483 ] INTERCEPT"
                  warningThreshold={15}
                  criticalThreshold={5}
                />
              </div>
            </div>
          )}

          {/* phase nav */}
          <div className="fixed bottom-3 right-3 flex gap-1">
            {(["detect", "alert", "countdown"] as const).map((p) => (
              <button
                key={p}
                className="eva-clip-corner-sm border border-eva-border px-3 py-1 text-[9px] uppercase tracking-wider text-eva-text-dim transition-colors hover:bg-[var(--eva-surface)]"
                onClick={() => {
                  setPhase(p);
                  setPalette(p === "detect" ? "normal" : "emergency");
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <Scanlines intensity="medium" />
        </div>
      </EvaProvider>
    );
  },
};
