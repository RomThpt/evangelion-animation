import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PatternAlert } from "../../registry/evangelion/components/pattern-alert";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof PatternAlert> = {
  title: "Components/PatternAlert",
  component: PatternAlert,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof PatternAlert>;

export const BluePattern: Story = {
  args: {
    pattern: "blue",
    designation: "SACHIEL",
    classification: "ANGEL - 3RD",
    confidence: 97.3,
  },
};

export const OrangePattern: Story = {
  args: {
    pattern: "orange",
    designation: "UNKNOWN",
    classification: "UNIDENTIFIED",
    confidence: 45.2,
  },
};

export const Interactive: Story = {
  render: () => {
    const [confirmed, setConfirmed] = useState(false);
    return (
      <PatternAlert
        pattern="blue"
        designation="RAMIEL"
        classification="ANGEL - 5TH"
        confidence={confirmed ? 99.9 : 82.1}
        confirmed={confirmed}
        onConfirm={() => setConfirmed(true)}
      />
    );
  },
};
