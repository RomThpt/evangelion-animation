import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../../registry/evangelion/provider/eva-provider";
import { StatusPanel } from "../../registry/evangelion/components/status-panel";
import { SyncGauge } from "../../registry/evangelion/components/sync-gauge";
import { SystemLog, type LogEntry } from "../../registry/evangelion/components/system-log";
import { ProgressBar } from "../../registry/evangelion/components/progress-bar";
import { DataReadout } from "../../registry/evangelion/components/data-readout";
import { WaveformDisplay } from "../../registry/evangelion/components/waveform-display";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { Scanlines } from "../../registry/evangelion/primitives/scanlines";

const logEntries: LogEntry[] = [
  { id: "1", timestamp: "14:32:01", message: "MAGI SYSTEM ONLINE", level: "system", source: "MAGI" },
  { id: "2", timestamp: "14:32:02", message: "ALL SECTORS NOMINAL", level: "info", source: "OPS" },
  { id: "3", timestamp: "14:32:05", message: "SYNCHRONIZATION TEST INITIATED", level: "info", source: "EVA-01" },
  { id: "4", timestamp: "14:32:08", message: "SYNC RATE WITHIN PARAMETERS", level: "info", source: "EVA-01" },
  { id: "5", timestamp: "14:32:12", message: "MONITORING ACTIVE", level: "system", source: "CMD" },
];

const meta: Meta = {
  title: "Compositions/NervCommandCenter",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <EvaProvider palette="normal" locale="ja">
      <div className="relative min-h-screen bg-eva-bg p-4">
        <div className="mb-4 text-center">
          <GlowText className="text-2xl tracking-[0.5em]" intensity="high">
            NERV HEADQUARTERS
          </GlowText>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {/* Pilot gauges */}
          <StatusPanel title="EVA-01" status="online" className="col-span-1">
            <SyncGauge value={78.5} pilotName="SHINJI" size={100} />
          </StatusPanel>
          <StatusPanel title="EVA-00" status="standby" className="col-span-1">
            <SyncGauge value={45.2} pilotName="REI" size={100} />
          </StatusPanel>
          <StatusPanel title="EVA-02" status="online" className="col-span-1">
            <SyncGauge value={92.1} pilotName="ASUKA" size={100} />
          </StatusPanel>

          {/* System readouts */}
          <StatusPanel title="MAGI STATUS" status="online" className="col-span-1">
            <div className="space-y-2">
              <DataReadout label="MELCHIOR" value={99.2} unit="%" />
              <DataReadout label="BALTHASAR" value={98.7} unit="%" />
              <DataReadout label="CASPER" value={99.8} unit="%" />
            </div>
          </StatusPanel>

          {/* Power systems */}
          <StatusPanel title="POWER GRID" status="online" className="col-span-2">
            <div className="space-y-2">
              <ProgressBar value={85} label="MAIN POWER" />
              <ProgressBar value={100} label="BACKUP POWER" variant="blocks" segments={10} />
              <ProgressBar value={42} label="RESERVE" variant="fill" />
            </div>
          </StatusPanel>

          {/* Waveforms */}
          <StatusPanel title="BIO-SIGNALS" status="online" className="col-span-2">
            <div className="space-y-2">
              <WaveformDisplay type="heartbeat" label="EVA-01 VITAL" width={280} height={40} />
              <WaveformDisplay type="sine" label="NEURAL LINK" width={280} height={40} />
            </div>
          </StatusPanel>

          {/* System log */}
          <div className="col-span-4">
            <StatusPanel title="SYSTEM LOG" status="online">
              <SystemLog entries={logEntries} className="w-full" />
            </StatusPanel>
          </div>
        </div>

        <Scanlines />
      </div>
    </EvaProvider>
  ),
};
