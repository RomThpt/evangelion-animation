import type { Meta, StoryObj } from "@storybook/react";
import { TypeWriter } from "../../registry/evangelion/primitives/type-writer";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof TypeWriter> = {
  title: "Primitives/TypeWriter",
  component: TypeWriter,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof TypeWriter>;

export const Default: Story = {
  args: { text: "INITIALIZING SYSTEM..." },
};

export const Fast: Story = {
  args: { text: "EMERGENCY PROTOCOL ACTIVATED", speed: 20 },
};

export const Slow: Story = {
  args: { text: "LOADING...", speed: 80 },
};

export const NoCursor: Story = {
  args: { text: "COMPLETE", cursor: false },
};
