import type { Meta, StoryObj } from "@storybook/react";
import { Scanlines } from "../../registry/evangelion/primitives/scanlines";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof Scanlines> = {
  title: "Primitives/Scanlines",
  component: Scanlines,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof Scanlines>;

export const Default: Story = {
  render: (args) => (
    <div className="relative h-48 w-64 bg-eva-surface p-4">
      <p className="text-eva-text">Content with scanlines</p>
      <Scanlines {...args} />
    </div>
  ),
};

export const Heavy: Story = {
  args: { opacity: 0.15, spacing: 3 },
  render: Default.render,
};
