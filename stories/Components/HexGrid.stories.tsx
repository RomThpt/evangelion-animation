import type { Meta, StoryObj } from "@storybook/react";
import { HexGrid, type HexCell } from "../../registry/evangelion/components/hex-grid";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof HexGrid> = {
  title: "Components/HexGrid",
  component: HexGrid,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof HexGrid>;

const generateCells = (rows: number, cols: number): HexCell[] => {
  const cells: HexCell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const rand = Math.random();
      cells.push({
        id: `${r}-${c}`,
        status: rand > 0.7 ? "active" : rand > 0.5 ? "warning" : "inactive",
        label: rand > 0.8 ? `${Math.floor(rand * 100)}` : undefined,
      });
    }
  }
  return cells;
};

export const Default: Story = {
  args: {
    rows: 6,
    cols: 8,
    cells: generateCells(6, 8),
  },
};

export const Small: Story = {
  args: {
    rows: 3,
    cols: 4,
    cells: generateCells(3, 4),
    cellSize: 32,
  },
};
