import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { MagiConsensus } from "../../registry/evangelion/components/magi-consensus";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof MagiConsensus> = {
  title: "Components/MagiConsensus",
  component: MagiConsensus,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof MagiConsensus>;

export const Processing: Story = {
  args: {
    nodes: [
      { name: "MELCHIOR-1", designation: "科学者", vote: "processing", confidence: 45.2 },
      { name: "BALTHASAR-2", designation: "母親", vote: "processing", confidence: 38.7 },
      { name: "CASPER-3", designation: "女", vote: "processing", confidence: 52.1 },
    ],
    consensus: "pending",
  },
};

export const Unanimous: Story = {
  args: {
    nodes: [
      { name: "MELCHIOR-1", designation: "科学者", vote: "approve", confidence: 98.3 },
      { name: "BALTHASAR-2", designation: "母親", vote: "approve", confidence: 97.1 },
      { name: "CASPER-3", designation: "女", vote: "approve", confidence: 99.2 },
    ],
    consensus: "unanimous",
  },
};

export const Majority: Story = {
  args: {
    nodes: [
      { name: "MELCHIOR-1", designation: "科学者", vote: "approve", confidence: 92.1 },
      { name: "BALTHASAR-2", designation: "母親", vote: "approve", confidence: 88.4 },
      { name: "CASPER-3", designation: "女", vote: "deny", confidence: 76.3 },
    ],
    consensus: "majority",
  },
};

export const Split: Story = {
  args: {
    nodes: [
      { name: "MELCHIOR-1", designation: "科学者", vote: "approve", confidence: 85.0 },
      { name: "BALTHASAR-2", designation: "母親", vote: "deny", confidence: 91.2 },
      { name: "CASPER-3", designation: "女", vote: "abstain", confidence: 50.0 },
    ],
    consensus: "split",
  },
};

export const Booting: Story = {
  args: {
    nodes: [
      { name: "MELCHIOR-1", designation: "科学者", vote: "processing", confidence: 0 },
      { name: "BALTHASAR-2", designation: "母親", vote: "processing", confidence: 0 },
      { name: "CASPER-3", designation: "女", vote: "processing", confidence: 0 },
    ],
    consensus: "pending",
    booting: true,
  },
};

export const Interactive: Story = {
  render: () => {
    const [nodes, setNodes] = useState([
      { name: "MELCHIOR-1", designation: "科学者", vote: "processing" as const, confidence: 0 },
      { name: "BALTHASAR-2", designation: "母親", vote: "processing" as const, confidence: 0 },
      { name: "CASPER-3", designation: "女", vote: "processing" as const, confidence: 0 },
    ]);
    const [consensus, setConsensus] = useState<"pending" | "unanimous" | "majority" | "split">("pending");

    const resolveVotes = () => {
      setNodes([
        { name: "MELCHIOR-1", designation: "科学者", vote: "approve", confidence: 95.3 },
        { name: "BALTHASAR-2", designation: "母親", vote: "approve", confidence: 88.7 },
        { name: "CASPER-3", designation: "女", vote: "deny", confidence: 72.1 },
      ]);
      setConsensus("majority");
    };

    return (
      <div>
        <MagiConsensus nodes={nodes} consensus={consensus} />
        <button onClick={resolveVotes} className="mt-4 border border-[var(--eva-border)] px-3 py-1 font-mono text-xs text-[var(--eva-text)]">
          RESOLVE VOTES
        </button>
      </div>
    );
  },
};
