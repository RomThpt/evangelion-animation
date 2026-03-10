import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../../registry/evangelion/provider/eva-provider";
import { StatusPanel } from "../../registry/evangelion/components/status-panel";
import { SyncGauge } from "../../registry/evangelion/components/sync-gauge";
import { SystemLog, type LogEntry } from "../../registry/evangelion/components/system-log";
import { ProgressBar } from "../../registry/evangelion/components/progress-bar";
import { DataReadout } from "../../registry/evangelion/components/data-readout";
import { WaveformDisplay } from "../../registry/evangelion/components/waveform-display";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { Flicker } from "../../registry/evangelion/primitives/flicker";
import { Scanlines } from "../../registry/evangelion/primitives/scanlines";
import { TypeWriter } from "../../registry/evangelion/primitives/type-writer";

const logEntries: LogEntry[] = [
  { id: "1", timestamp: "14:32:01.330", message: "MAGI\u30B7\u30B9\u30C6\u30E0 ONLINE -- ALL CORES RESPONDING", level: "system", source: "MAGI" },
  { id: "2", timestamp: "14:32:02.112", message: "SECTOR 7G THROUGH 12A NOMINAL", level: "info", source: "OPS" },
  { id: "3", timestamp: "14:32:04.891", message: ">>>003:EVA-01 \u540C\u671F\u7387\u30C6\u30B9\u30C8\u958B\u59CB", level: "info", source: "EVA-01" },
  { id: "4", timestamp: "14:32:08.445", message: "SYNC RATE 78.5% -- WITHIN PARAMETERS", level: "info", source: "EVA-01" },
  { id: "5", timestamp: "14:32:11.220", message: "0x00FF:MONITOR >> \u76E3\u8996\u30E2\u30FC\u30C9\u79FB\u884C", level: "system", source: "CMD" },
  { id: "6", timestamp: "14:32:15.001", message: "\u96FB\u529B\u30B0\u30EA\u30C3\u30C9 STABLE AT 98.2%", level: "info", source: "PWR" },
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
      <div className="relative min-h-screen bg-[var(--eva-bg)] p-3">
        {/* header bar */}
        <div className="mb-3 flex items-center justify-between border-b border-eva-border pb-2">
          <div className="flex items-center gap-3">
            <Flicker intensity="subtle">
              <GlowText className="text-lg tracking-[0.4em]" intensity="high">
                NERV
              </GlowText>
            </Flicker>
            <span className="text-[8px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
              {">>>001:\u4F5C\u6226\u6307\u63EE\u6240"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] text-eva-text-dim">
              <TypeWriter text="OPERATIONAL MODE: STANDBY" speed={20} cursor={false} jitter />
            </span>
            <Flicker>
              <span className="text-[8px] text-[var(--eva-primary)]">
                {"\u25CF"} ACTIVE
              </span>
            </Flicker>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-2">
          {/* pilot gauges row */}
          <StatusPanel title="EVA-01" titleJa="\u521D\u53F7\u6A5F" code="001" status="online" className="col-span-3">
            <div className="flex flex-col items-center gap-1">
              <SyncGauge value={78.5} pilotName="\u78CA\u30B7\u30F3\u30B8" size={100} />
              <WaveformDisplay type="heartbeat" width={140} height={30} label="BIO" />
            </div>
          </StatusPanel>
          <StatusPanel title="EVA-00" titleJa="\u96F6\u53F7\u6A5F" code="002" status="standby" className="col-span-3">
            <div className="flex flex-col items-center gap-1">
              <SyncGauge value={45.2} pilotName="\u7DBE\u6CE2\u30EC\u30A4" size={100} />
              <WaveformDisplay type="sine" width={140} height={30} label="BIO" speed={0.5} />
            </div>
          </StatusPanel>
          <StatusPanel title="EVA-02" titleJa="\u5F10\u53F7\u6A5F" code="003" status="online" className="col-span-3">
            <div className="flex flex-col items-center gap-1">
              <SyncGauge value={92.1} pilotName="\u60E3\u6D41\u30A2\u30B9\u30AB" size={100} />
              <WaveformDisplay type="heartbeat" width={140} height={30} label="BIO" speed={1.2} />
            </div>
          </StatusPanel>

          {/* MAGI readouts */}
          <StatusPanel title="MAGI" titleJa="MAGI\u30B7\u30B9\u30C6\u30E0" code="SYS" status="online" className="col-span-3">
            <div className="space-y-1.5">
              <DataReadout label="MELCHIOR" value={99.2} unit="%" precision={1} trend="stable" />
              <DataReadout label="BALTHASAR" value={98.7} unit="%" precision={1} trend="stable" />
              <DataReadout label="CASPER" value={99.8} unit="%" precision={1} trend="up" />
            </div>
          </StatusPanel>

          {/* power + environmental */}
          <StatusPanel title="POWER" titleJa="\u96FB\u529B" code="PWR" status="online" className="col-span-6">
            <div className="space-y-1.5">
              <ProgressBar value={85} label="MAIN POWER" labelJa="\u4E3B\u96FB\u6E90" />
              <ProgressBar value={100} label="BACKUP" labelJa="\u4E88\u5099" variant="blocks" segments={10} />
              <ProgressBar value={42} label="RESERVE" labelJa="\u4FDD\u6709" variant="fill" />
            </div>
          </StatusPanel>

          {/* signals */}
          <StatusPanel title="SIGNAL" titleJa="\u4FE1\u53F7" code="SIG" status="online" className="col-span-6">
            <div className="space-y-1.5">
              <WaveformDisplay type="sine" label="[ \u795E\u7D4C\u63A5\u7D9A ] NEURAL" width={280} height={35} />
              <WaveformDisplay type="noise" label="[ \u30CE\u30A4\u30BA ] INTERFERENCE" width={280} height={35} amplitude={0.4} />
            </div>
          </StatusPanel>

          {/* system log */}
          <div className="col-span-12">
            <StatusPanel title="SYSTEM LOG" titleJa="\u30B7\u30B9\u30C6\u30E0\u30ED\u30B0" code="LOG" status="online">
              <SystemLog entries={logEntries} className="w-full" />
            </StatusPanel>
          </div>
        </div>

        <Scanlines intensity="medium" />
      </div>
    </EvaProvider>
  ),
};
