import type { Meta, StoryObj } from "@storybook/react";
import { CountdownTimer } from "../../registry/evangelion/components/countdown-timer";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof CountdownTimer> = {
  title: "Components/CountdownTimer",
  component: CountdownTimer,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof CountdownTimer>;

export const Default: Story = {
  args: { targetTime: 300, label: "OPERATION TIMER" },
};

export const Critical: Story = {
  args: { targetTime: 8, label: "SELF DESTRUCT", format: "MM:SS" },
};

export const Long: Story = {
  args: { targetTime: 3661, label: "MISSION ELAPSED", format: "HH:MM:SS" },
};

export const Paused: Story = {
  args: { targetTime: 120, label: "PAUSED TIMER", paused: true },
};
