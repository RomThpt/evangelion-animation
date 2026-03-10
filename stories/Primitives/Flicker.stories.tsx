import type { Meta, StoryObj } from "@storybook/react";
import { Flicker } from "../../registry/evangelion/primitives/flicker";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof Flicker> = {
  title: "Primitives/Flicker",
  component: Flicker,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof Flicker>;

export const Default: Story = {
  render: () => (
    <Flicker>
      <GlowText className="text-2xl">ACTIVE SIGNAL</GlowText>
    </Flicker>
  ),
};

export const Aggressive: Story = {
  render: () => (
    <Flicker minOpacity={0.6} maxOpacity={1} minInterval={30} maxInterval={100}>
      <GlowText className="text-2xl" intensity="high">
        UNSTABLE
      </GlowText>
    </Flicker>
  ),
};
