import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../registry/evangelion/provider/eva-provider";
import { GlowText } from "../registry/evangelion/primitives/glow-text";

const meta: Meta<typeof EvaProvider> = {
  title: "Foundation/EvaProvider",
  component: EvaProvider,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof EvaProvider>;

export const Normal: Story = {
  args: { palette: "normal", locale: "ja" },
  render: (args) => (
    <EvaProvider {...args}>
      <div className="space-y-4 p-8">
        <GlowText className="text-2xl">NERV HEADQUARTERS</GlowText>
        <p className="text-eva-text-dim text-sm">
          palette: {args.palette} / locale: {args.locale}
        </p>
      </div>
    </EvaProvider>
  ),
};

export const Caution: Story = {
  args: { palette: "caution", locale: "ja" },
  render: Normal.render,
};

export const Emergency: Story = {
  args: { palette: "emergency", locale: "en" },
  render: Normal.render,
};
