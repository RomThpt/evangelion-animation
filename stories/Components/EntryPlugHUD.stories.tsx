import type { Meta, StoryObj } from "@storybook/react";
import { EntryPlugHUD } from "../../registry/evangelion/components/entry-plug-hud";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof EntryPlugHUD> = {
  title: "Components/EntryPlugHUD",
  component: EntryPlugHUD,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof EntryPlugHUD>;

export const Default: Story = {
  args: {
    syncRate: 78.5,
    lclLevel: 95,
    targets: [
      { id: "1", name: "SACHIEL", distance: 1200, locked: true },
      { id: "2", name: "CONTACT-B", distance: 3500 },
    ],
  },
  render: (args) => (
    <div className="h-[500px] w-full">
      <EntryPlugHUD {...args} />
    </div>
  ),
};

export const CommsOffline: Story = {
  args: {
    syncRate: 45.2,
    commsActive: false,
    lclLevel: 78,
    targets: [{ id: "1", name: "UNKNOWN", distance: 800 }],
  },
  render: (args) => (
    <div className="h-[500px] w-full">
      <EntryPlugHUD {...args} />
    </div>
  ),
};
