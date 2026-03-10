import type { Meta, StoryObj } from "@storybook/react";
import { StatusPanel } from "../../registry/evangelion/components/status-panel";
import { GlowText } from "../../registry/evangelion/primitives/glow-text";
import { DataReadout } from "../../registry/evangelion/components/data-readout";
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
    titleJa: "MAGI\u30B7\u30B9\u30C6\u30E0",
    code: "SYS",
    status: "online",
    children: (
      <div className="space-y-1.5">
        <DataReadout label="MELCHIOR" value={99.2} unit="%" trend="stable" />
        <DataReadout label="BALTHASAR" value={98.7} unit="%" trend="stable" />
        <DataReadout label="CASPER" value={99.8} unit="%" trend="up" />
      </div>
    ),
  },
};

export const Error: Story = {
  args: {
    title: "ALERT",
    titleJa: "\u8B66\u544A",
    code: "A01",
    status: "error",
    children: (
      <GlowText className="text-xs" intensity="high" pulse>
        <span className="text-red-500">{"\u30D1\u30BF\u30FC\u30F3\u30D6\u30EB\u30FC"} PATTERN BLUE DETECTED</span>
      </GlowText>
    ),
  },
};

export const Collapsible: Story = {
  args: {
    title: "PILOT DATA",
    titleJa: "\u30D1\u30A4\u30ED\u30C3\u30C8\u30C7\u30FC\u30BF",
    code: "P01",
    status: "standby",
    collapsible: true,
    children: <p className="text-[10px] text-eva-text-dim">{"\u540C\u671F\u5F85\u6A5F\u4E2D"}... AWAITING SYNC</p>,
  },
};
