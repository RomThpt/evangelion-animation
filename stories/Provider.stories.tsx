import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../registry/evangelion/provider/eva-provider";
import { GlowText } from "../registry/evangelion/primitives/glow-text";
import { Flicker } from "../registry/evangelion/primitives/flicker";
import { Scanlines } from "../registry/evangelion/primitives/scanlines";

const meta: Meta<typeof EvaProvider> = {
  title: "Foundation/EvaProvider",
  component: EvaProvider,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof EvaProvider>;

const Content = ({ palette }: { palette: string }) => (
  <div className="relative space-y-3 p-6">
    <Flicker intensity="subtle">
      <GlowText className="text-xl tracking-[0.3em]" intensity="high">
        NERV
      </GlowText>
    </Flicker>
    <p className="eva-label text-[9px]">
      {"[ \u30D1\u30EC\u30C3\u30C8 ] PALETTE: "}{palette.toUpperCase()}
    </p>
    <div className="h-px bg-eva-border" />
    <p className="text-[10px] text-eva-text-dim">
      {"\u30B7\u30B9\u30C6\u30E0\u30C1\u30A7\u30C3\u30AF"} -- ALL SYSTEMS NOMINAL
    </p>
    <Scanlines intensity="subtle" />
  </div>
);

export const Normal: Story = {
  args: { palette: "normal", locale: "ja" },
  render: (args) => (
    <EvaProvider {...args}>
      <Content palette={args.palette ?? "normal"} />
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
