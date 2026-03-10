import type { Meta, StoryObj } from "@storybook/react";
import { ATFieldDiagram } from "../../registry/evangelion/components/at-field-diagram";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof ATFieldDiagram> = {
  title: "Components/ATFieldDiagram",
  component: ATFieldDiagram,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof ATFieldDiagram>;

const defaultSectors = [
  { label: "N", strength: 95, integrity: 100 },
  { label: "NE", strength: 88, integrity: 90 },
  { label: "E", strength: 72, integrity: 85 },
  { label: "SE", strength: 60, integrity: 70 },
  { label: "S", strength: 85, integrity: 95 },
  { label: "SW", strength: 90, integrity: 100 },
  { label: "W", strength: 78, integrity: 80 },
  { label: "NW", strength: 92, integrity: 98 },
];

export const Default: Story = {
  args: { sectors: defaultSectors, overallStrength: 82 },
};

export const Breached: Story = {
  args: { sectors: defaultSectors, overallStrength: 35, breached: true },
};
