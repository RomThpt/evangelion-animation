import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SpectrumAnalyzer } from "../../registry/evangelion/components/spectrum-analyzer";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof SpectrumAnalyzer> = {
  title: "Components/SpectrumAnalyzer",
  component: SpectrumAnalyzer,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof SpectrumAnalyzer>;

export const Static: Story = {
  args: {
    data: Array.from({ length: 32 }, (_, i) => Math.sin(i / 5) * 0.5 + 0.5),
  },
};

export const Animated: Story = {
  render: () => {
    const [data, setData] = useState(() => Array.from({ length: 32 }, () => Math.random()));
    useEffect(() => {
      const id = setInterval(() => {
        setData(prev => prev.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.3))));
      }, 100);
      return () => clearInterval(id);
    }, []);
    return <SpectrumAnalyzer data={data} />;
  },
};

export const PeakHold: Story = {
  render: () => {
    const [data, setData] = useState(() => Array.from({ length: 32 }, () => Math.random()));
    useEffect(() => {
      const id = setInterval(() => {
        setData(prev => prev.map(v => Math.max(0, Math.min(1, v + (Math.random() - 0.5) * 0.4))));
      }, 150);
      return () => clearInterval(id);
    }, []);
    return <SpectrumAnalyzer data={data} peakHold peakDecayRate={0.15} />;
  },
};

export const HighBarCount: Story = {
  args: {
    barCount: 64,
    data: Array.from({ length: 64 }, (_, i) => Math.sin(i / 8) * 0.4 + 0.3),
  },
};

export const LowBarCount: Story = {
  args: {
    barCount: 8,
    data: [0.8, 0.6, 0.9, 0.4, 0.7, 0.3, 0.5, 0.2],
  },
};

export const WithLabels: Story = {
  args: {
    data: Array.from({ length: 32 }, (_, i) => Math.sin(i / 4) * 0.5 + 0.5),
    showFrequencyLabels: true,
    showAmplitudeGrid: true,
    label: "SPECTRUM",
  },
};
