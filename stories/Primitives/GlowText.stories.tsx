import type { Meta, StoryObj } from "@storybook/react";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof GlowText> = {
  title: "Primitives/GlowText",
  component: GlowText,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof GlowText>;

export const Low: Story = {
  args: { children: "NERV", intensity: "low", className: "text-3xl" },
};

export const Medium: Story = {
  args: { children: "NERV", intensity: "medium", className: "text-3xl" },
};

export const High: Story = {
  args: { children: "NERV", intensity: "high", className: "text-3xl" },
};

export const Pulsing: Story = {
  args: { children: "EMERGENCY", pulse: true, className: "text-3xl" },
};
