import type { Meta, StoryObj } from "@storybook/react";
import { Scanlines } from "../../registry/evangelion/primitives/scanlines";
import { withEvaProvider } from "../../.storybook/eva-decorator";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";

const meta: Meta<typeof Scanlines> = {
  title: "Primitives/Scanlines",
  component: Scanlines,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof Scanlines>;

export const Default: Story = {
  render: (args) => (
    <div className="relative h-48 w-64 bg-[var(--eva-surface)] p-4">
      <GlowText className="text-sm">CONTENT WITH SCANLINES</GlowText>
      <p className="mt-2 text-[10px] text-eva-text-dim">
        {">>>CRT\u30C7\u30A3\u30B9\u30D7\u30EC\u30A4"} OVERLAY
      </p>
      <Scanlines {...args} />
    </div>
  ),
};

export const Heavy: Story = {
  args: { intensity: "heavy" },
  render: Default.render,
};

export const Subtle: Story = {
  args: { intensity: "subtle" },
  render: Default.render,
};
