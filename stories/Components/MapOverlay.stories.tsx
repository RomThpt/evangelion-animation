import type { Meta, StoryObj } from "@storybook/react";
import { MapOverlay, type MapMarker } from "../../registry/evangelion/components/map-overlay";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof MapOverlay> = {
  title: "Components/MapOverlay",
  component: MapOverlay,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof MapOverlay>;

const markers: MapMarker[] = [
  { id: "1", position: { x: 50, y: -30 }, type: "friendly", label: "EVA-01" },
  { id: "2", position: { x: -80, y: 60 }, type: "hostile", label: "ANGEL" },
  { id: "3", position: { x: 120, y: 20 }, type: "unknown", label: "CONTACT" },
  { id: "4", position: { x: -20, y: -80 }, type: "poi", label: "HQ" },
];

export const Default: Story = {
  args: {
    markers,
    rangeCircles: [
      { radius: 100, label: "1km" },
      { radius: 200, label: "2km" },
    ],
  },
};

export const Zoomed: Story = {
  args: {
    markers,
    zoom: 2,
    rangeCircles: [{ radius: 50, label: "500m" }],
  },
};
