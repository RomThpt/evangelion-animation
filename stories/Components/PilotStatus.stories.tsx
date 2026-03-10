import type { Meta, StoryObj } from "@storybook/react";
import { PilotStatus, type PilotData } from "../../registry/evangelion/components/pilot-status";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof PilotStatus> = {
  title: "Components/PilotStatus",
  component: PilotStatus,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof PilotStatus>;

const shinji: PilotData = {
  name: "SHINJI IKARI",
  designation: "EVA-01",
  syncRate: 78.5,
  heartRate: 72,
  neuralLink: 85,
  plugDepth: 42.3,
  contamination: 12,
  status: "connected",
};

const rei: PilotData = {
  name: "REI AYANAMI",
  designation: "EVA-00",
  syncRate: 45.2,
  heartRate: 55,
  neuralLink: 92,
  plugDepth: 38.1,
  contamination: 5,
  status: "standby",
};

export const Connected: Story = {
  args: { pilot: shinji, className: "w-[280px]" },
};

export const Standby: Story = {
  args: { pilot: rei, className: "w-[280px]" },
};

export const Disconnected: Story = {
  args: {
    pilot: { ...shinji, status: "disconnected", syncRate: 0, heartRate: 0, neuralLink: 0 },
    className: "w-[280px]",
  },
};

export const Compact: Story = {
  args: { pilot: shinji, compact: true, className: "w-[280px]" },
};
