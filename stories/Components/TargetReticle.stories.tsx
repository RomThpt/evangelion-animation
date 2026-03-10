import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TargetReticle } from "../../registry/evangelion/components/target-reticle";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof TargetReticle> = {
  title: "Components/TargetReticle",
  component: TargetReticle,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof TargetReticle>;

export const Unlocked: Story = {
  args: { targetName: "TARGET ALPHA", distance: 1250 },
};

export const Locked: Story = {
  args: { locked: true, targetName: "ANGEL", distance: 800 },
};

export const Interactive: Story = {
  render: () => {
    const [locked, setLocked] = useState(false);
    return (
      <TargetReticle
        locked={locked}
        onToggleLock={() => setLocked((l) => !l)}
        targetName="SACHIEL"
        distance={locked ? 450 : 1200}
      />
    );
  },
};
