import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SyncGauge } from "../../registry/evangelion/components/sync-gauge";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof SyncGauge> = {
  title: "Components/SyncGauge",
  component: SyncGauge,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof SyncGauge>;

export const Default: Story = {
  args: { value: 75.3, pilotName: "SHINJI IKARI" },
};

export const Critical: Story = {
  args: { value: 12.5, pilotName: "REI AYANAMI" },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return (
      <div className="flex flex-col items-center gap-4">
        <SyncGauge value={value} pilotName="ASUKA LANGLEY" />
        <input
          type="range"
          min={0}
          max={150}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-48"
        />
      </div>
    );
  },
};
