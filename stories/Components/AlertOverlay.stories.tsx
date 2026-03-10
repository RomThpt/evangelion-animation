import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AlertOverlay } from "../../registry/evangelion/components/alert-overlay";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof AlertOverlay> = {
  title: "Components/AlertOverlay",
  component: AlertOverlay,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof AlertOverlay>;

export const Emergency: Story = {
  args: {
    level: "emergency",
    message: "ANGEL DETECTED IN TERMINAL DOGMA",
    code: "ERROR-601",
    visible: true,
  },
};

export const Caution: Story = {
  args: {
    level: "caution",
    message: "SYNC RATE BELOW THRESHOLD",
    code: "WARN-042",
    visible: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    return (
      <div>
        <button
          className="border border-eva-border px-4 py-2 text-eva-text"
          onClick={() => setVisible(true)}
        >
          TRIGGER ALERT
        </button>
        <AlertOverlay
          level="emergency"
          message="ALL PERSONNEL TO BATTLE STATIONS"
          code="RED-001"
          visible={visible}
          onDismiss={() => setVisible(false)}
        />
      </div>
    );
  },
};
