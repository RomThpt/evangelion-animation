import type { Meta, StoryObj } from "@storybook/react";
import { EvaProvider } from "../../registry/evangelion/provider/eva-provider";
import { EntryPlugHUD } from "../../registry/evangelion/components/entry-plug-hud";

const meta: Meta = {
  title: "Compositions/EntryPlugView",
  parameters: { layout: "fullscreen" },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <EvaProvider palette="normal" locale="ja">
      <div className="h-screen w-full">
        <EntryPlugHUD
          syncRate={78.5}
          lclLevel={95}
          targets={[
            { id: "1", name: "SACHIEL", distance: 1200, locked: true },
            { id: "2", name: "CONTACT-B", distance: 3500 },
            { id: "3", name: "CONTACT-C", distance: 5800 },
          ]}
        />
      </div>
    </EvaProvider>
  ),
};
