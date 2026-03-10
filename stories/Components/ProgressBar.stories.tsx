import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "../../registry/evangelion/components/progress-bar";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Segments: Story = {
  args: { value: 65, label: "POWER LEVEL" },
};

export const Fill: Story = {
  args: { value: 80, label: "LOADING", variant: "fill" },
};

export const Blocks: Story = {
  args: { value: 45, label: "CONTAMINATION", variant: "blocks", segments: 10 },
};

export const Animated: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => {
        setValue((v) => (v >= 100 ? 0 : v + 5));
      }, 300);
      return () => clearInterval(id);
    }, []);
    return <ProgressBar value={value} label="ACTIVATION SEQUENCE" />;
  },
};
