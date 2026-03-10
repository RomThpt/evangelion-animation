import type { Meta, StoryObj } from "@storybook/react";
import { RadarSweep } from "../../registry/evangelion/components/radar-sweep";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof RadarSweep> = {
  title: "Components/RadarSweep",
  component: RadarSweep,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof RadarSweep>;

export const Empty: Story = {
  args: {},
};

export const WithTargets: Story = {
  args: {
    targets: [
      { id: "t1", angle: 45, range: 0.6, type: "hostile", label: "ANGEL-03" },
      { id: "t2", angle: 180, range: 0.3, type: "friendly", label: "EVA-01" },
      { id: "t3", angle: 270, range: 0.8, type: "unknown" },
    ],
  },
};

export const ManyTargets: Story = {
  args: {
    targets: [
      { id: "t1", angle: 0, range: 0.2, type: "friendly", label: "EVA-01" },
      { id: "t2", angle: 45, range: 0.7, type: "hostile", label: "SACHIEL" },
      { id: "t3", angle: 90, range: 0.4, type: "friendly", label: "EVA-02" },
      { id: "t4", angle: 135, range: 0.9, type: "unknown" },
      { id: "t5", angle: 200, range: 0.5, type: "hostile" },
      { id: "t6", angle: 250, range: 0.3, type: "friendly", label: "EVA-00" },
      { id: "t7", angle: 310, range: 0.6, type: "hostile", label: "RAMIEL" },
      { id: "t8", angle: 350, range: 0.15, type: "unknown" },
    ],
  },
};

export const SlowSweep: Story = {
  args: {
    sweepSpeed: 0.15,
    targets: [
      { id: "t1", angle: 90, range: 0.5, type: "hostile", label: "TARGET" },
    ],
  },
};

export const FastSweep: Story = {
  args: {
    sweepSpeed: 2,
    targets: [
      { id: "t1", angle: 120, range: 0.4, type: "hostile" },
      { id: "t2", angle: 240, range: 0.7, type: "friendly" },
    ],
  },
};
