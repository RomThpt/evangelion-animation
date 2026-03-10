import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  PowerGrid,
  type PowerChannel,
} from "../../registry/evangelion/components/power-grid";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof PowerGrid> = {
  title: "Components/PowerGrid",
  component: PowerGrid,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof PowerGrid>;

export const Default: Story = {
  args: {
    label: "POWER",
    code: "PWR",
    totalOutput: 245.8,
    channels: [
      { id: "1", label: "UMBILICAL-A", load: 120, capacity: 200, status: "active" },
      { id: "2", label: "UMBILICAL-B", load: 80, capacity: 200, status: "active" },
      { id: "3", label: "AUX-POWER", load: 10, capacity: 50, status: "standby" },
    ],
  },
};

export const Critical: Story = {
  args: {
    label: "POWER",
    code: "PWR",
    totalOutput: 380.2,
    channels: [
      { id: "1", label: "UMBILICAL-A", load: 190, capacity: 200, status: "active" },
      { id: "2", label: "UMBILICAL-B", load: 185, capacity: 200, status: "active" },
      { id: "3", label: "AUX-POWER", load: 48, capacity: 50, status: "active" },
    ],
    criticalThreshold: 0.85,
  },
};

export const WithBattery: Story = {
  args: {
    label: "POWER",
    code: "PWR",
    totalOutput: 150.0,
    batteryLevel: 64,
    batteryTime: "04:59",
    channels: [
      { id: "1", label: "UMBILICAL-A", load: 0, capacity: 200, status: "severed" },
      { id: "2", label: "INTERNAL", load: 150, capacity: 200, status: "active" },
    ],
  },
};

export const AllSevered: Story = {
  args: {
    label: "POWER",
    code: "PWR",
    totalOutput: 0,
    batteryLevel: 12,
    batteryTime: "00:47",
    channels: [
      { id: "1", label: "UMBILICAL-A", load: 0, capacity: 200, status: "severed" },
      { id: "2", label: "UMBILICAL-B", load: 0, capacity: 200, status: "severed" },
      { id: "3", label: "AUX-POWER", load: 0, capacity: 50, status: "severed" },
    ],
  },
};

export const Animated: Story = {
  render: () => {
    const [channels, setChannels] = useState<PowerChannel[]>([
      { id: "1", label: "UMBILICAL-A", load: 100, capacity: 200, status: "active" },
      { id: "2", label: "UMBILICAL-B", load: 80, capacity: 200, status: "active" },
      { id: "3", label: "AUX-POWER", load: 20, capacity: 50, status: "standby" },
    ]);

    useEffect(() => {
      const id = setInterval(() => {
        setChannels((prev) =>
          prev.map((ch) => ({
            ...ch,
            load:
              ch.status === "active"
                ? Math.max(
                    0,
                    Math.min(ch.capacity, ch.load + (Math.random() - 0.45) * 20),
                  )
                : ch.load,
          })),
        );
      }, 1000);
      return () => clearInterval(id);
    }, []);

    const total = channels.reduce((s, c) => s + c.load, 0);
    return (
      <PowerGrid label="POWER" code="PWR" channels={channels} totalOutput={total} />
    );
  },
};

export const LowPower: Story = {
  args: {
    label: "POWER",
    code: "PWR",
    totalOutput: 15.3,
    batteryLevel: 5,
    batteryTime: "00:12",
    channels: [
      { id: "1", label: "EMERGENCY", load: 15.3, capacity: 50, status: "active" },
    ],
  },
};
