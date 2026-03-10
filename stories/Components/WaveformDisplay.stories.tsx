import type { Meta, StoryObj } from "@storybook/react";
import { WaveformDisplay } from "../../registry/evangelion/components/waveform-display";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof WaveformDisplay> = {
  title: "Components/WaveformDisplay",
  component: WaveformDisplay,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof WaveformDisplay>;

export const Sine: Story = {
  args: { type: "sine", label: "NEURAL SIGNAL" },
};

export const Heartbeat: Story = {
  args: { type: "heartbeat", label: "HEART RATE" },
};

export const Noise: Story = {
  args: { type: "noise", label: "INTERFERENCE" },
};

export const Flat: Story = {
  args: { type: "flat", label: "DISCONNECTED" },
};
