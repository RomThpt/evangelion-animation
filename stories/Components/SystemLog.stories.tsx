import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SystemLog, type LogEntry } from "../../registry/evangelion/components/system-log";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof SystemLog> = {
  title: "Components/SystemLog",
  component: SystemLog,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof SystemLog>;

const staticEntries: LogEntry[] = [
  { id: "1", timestamp: "14:32:01", message: "MAGI SYSTEM ONLINE", level: "system", source: "MAGI" },
  { id: "2", timestamp: "14:32:02", message: "ALL SECTORS NOMINAL", level: "info", source: "OPS" },
  { id: "3", timestamp: "14:32:05", message: "PATTERN BLUE DETECTED", level: "error", source: "SENSOR" },
  { id: "4", timestamp: "14:32:06", message: "INITIATING BATTLE STATIONS", level: "warning", source: "CMD" },
];

export const Default: Story = {
  args: { entries: staticEntries, className: "w-[500px]" },
};

export const LiveFeed: Story = {
  render: () => {
    const [entries, setEntries] = useState<LogEntry[]>(staticEntries);
    const messages = [
      "SYNCHRONIZATION CHECK COMPLETE",
      "POWER GRID STABLE",
      "PILOT NEURAL LINK NOMINAL",
      "UPDATING TARGETING MATRIX",
      "LCL PRESSURE NOMINAL",
    ];
    useEffect(() => {
      const id = setInterval(() => {
        const now = new Date();
        const ts = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
        setEntries((prev) => [
          ...prev,
          {
            id: String(Date.now()),
            timestamp: ts,
            message: messages[Math.floor(Math.random() * messages.length)],
            level: Math.random() > 0.8 ? "warning" : "info",
            source: "SYS",
          },
        ]);
      }, 2000);
      return () => clearInterval(id);
    }, []);
    return <SystemLog entries={entries} className="w-[500px]" />;
  },
};
