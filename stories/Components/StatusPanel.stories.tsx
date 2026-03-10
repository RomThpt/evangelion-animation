import type { Meta, StoryObj } from "@storybook/react";
import { StatusPanel } from "../../registry/evangelion/components/status-panel";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof StatusPanel> = {
  title: "Components/StatusPanel",
  component: StatusPanel,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof StatusPanel>;

export const Online: Story = {
  args: {
    title: "MAGI SYSTEM",
    status: "online",
    children: (
      <div className="space-y-2">
        <GlowText className="text-sm">MELCHIOR-1: ACTIVE</GlowText>
        <GlowText className="text-sm">BALTHASAR-2: ACTIVE</GlowText>
        <GlowText className="text-sm">CASPER-3: ACTIVE</GlowText>
      </div>
    ),
  },
};

export const Error: Story = {
  args: {
    title: "ALERT SYSTEM",
    status: "error",
    children: <GlowText className="text-sm">PATTERN BLUE DETECTED</GlowText>,
  },
};

export const Collapsible: Story = {
  args: {
    title: "PILOT DATA",
    status: "standby",
    collapsible: true,
    children: <p className="text-eva-text-dim text-sm">Awaiting synchronization...</p>,
  },
};
