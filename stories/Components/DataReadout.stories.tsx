import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { DataReadout } from "../../registry/evangelion/components/data-readout";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof DataReadout> = {
  title: "Components/DataReadout",
  component: DataReadout,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof DataReadout>;

export const Default: Story = {
  args: { label: "SYNC RATE", value: 75.3, unit: "%", trend: "up" },
};

export const LiveUpdate: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    useEffect(() => {
      const id = setInterval(() => {
        setValue((v) => v + (Math.random() - 0.45) * 5);
      }, 1000);
      return () => clearInterval(id);
    }, []);
    return (
      <div className="flex gap-4">
        <DataReadout label="POWER" value={value} unit="MW" trend={value > 50 ? "up" : "down"} />
        <DataReadout label="TEMP" value={value * 0.6} unit="C" precision={1} />
      </div>
    );
  },
};
