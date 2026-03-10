import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { LCLDepthMeter } from "../../registry/evangelion/components/lcl-depth-meter";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof LCLDepthMeter> = {
  title: "Components/LCLDepthMeter",
  component: LCLDepthMeter,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof LCLDepthMeter>;

export const Empty: Story = {
  args: {
    level: 0,
    label: "LCL",
  },
};

export const Filling: Story = {
  args: {
    level: 45,
    pressure: 230,
    label: "LCL",
  },
};

export const Full: Story = {
  args: {
    level: 100,
    pressure: 480,
    label: "LCL",
  },
};

export const Contaminated: Story = {
  args: {
    level: 78,
    pressure: 350,
    contamination: 85,
    label: "LCL",
  },
};

export const SlightlyContam: Story = {
  args: {
    level: 62,
    pressure: 290,
    contamination: 52,
    label: "LCL",
  },
};

export const Interactive: Story = {
  render: () => {
    const [level, setLevel] = useState(30);
    const [contamination, setContamination] = useState(10);

    return (
      <div className="flex gap-8 items-end">
        <LCLDepthMeter
          level={level}
          pressure={level * 4.8}
          contamination={contamination}
          label="LCL"
        />
        <div className="flex flex-col gap-3 font-mono text-xs text-[var(--eva-text)]">
          <label>
            Level: {level}%
            <input
              type="range"
              min={0}
              max={100}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="block w-40"
            />
          </label>
          <label>
            Contamination: {contamination}%
            <input
              type="range"
              min={0}
              max={100}
              value={contamination}
              onChange={(e) => setContamination(Number(e.target.value))}
              className="block w-40"
            />
          </label>
        </div>
      </div>
    );
  },
};
