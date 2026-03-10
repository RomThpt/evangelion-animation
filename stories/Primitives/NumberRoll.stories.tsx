import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NumberRoll } from "../../registry/evangelion/primitives/number-roll";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof NumberRoll> = {
  title: "Primitives/NumberRoll",
  component: NumberRoll,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof NumberRoll>;

export const Default: Story = {
  args: { value: 42.5, precision: 1, suffix: "%" },
};

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState(0);
    return (
      <div className="space-y-4">
        <NumberRoll value={value} precision={1} suffix="%" className="text-4xl" />
        <div className="flex gap-2">
          <button
            className="border border-eva-border px-3 py-1 text-eva-text"
            onClick={() => setValue(Math.random() * 100)}
          >
            RANDOMIZE
          </button>
          <button
            className="border border-eva-border px-3 py-1 text-eva-text"
            onClick={() => setValue(100)}
          >
            MAX
          </button>
          <button
            className="border border-eva-border px-3 py-1 text-eva-text"
            onClick={() => setValue(0)}
          >
            ZERO
          </button>
        </div>
      </div>
    );
  },
};
