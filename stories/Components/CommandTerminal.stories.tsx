import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  CommandTerminal,
  type TerminalEntry,
} from "../../registry/evangelion/components/command-terminal";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof CommandTerminal> = {
  title: "Components/CommandTerminal",
  component: CommandTerminal,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof CommandTerminal>;

export const Default: Story = {
  args: {
    label: "TERMINAL",
  },
};

export const Interactive: Story = {
  render: () => {
    const [history, setHistory] = useState<TerminalEntry[]>([
      {
        id: "0",
        timestamp: "00:00:01",
        message: "NERV Terminal v3.14 initialized.",
        level: "system",
      },
    ]);
    let nextId = 1;

    const handleCommand = (cmd: string) => {
      const id = String(nextId++);
      const inputEntry: TerminalEntry = {
        id: `in-${id}`,
        timestamp: new Date().toLocaleTimeString("en-GB"),
        message: cmd,
        level: "input",
      };

      let response: TerminalEntry;
      if (cmd === "status") {
        response = {
          id: `out-${id}`,
          timestamp: new Date().toLocaleTimeString("en-GB"),
          message: "All systems nominal. MAGI consensus: UNANIMOUS.",
          level: "output",
        };
      } else if (cmd === "help") {
        response = {
          id: `out-${id}`,
          timestamp: new Date().toLocaleTimeString("en-GB"),
          message: "Available commands: status, help, sync, abort",
          level: "system",
        };
      } else {
        response = {
          id: `out-${id}`,
          timestamp: new Date().toLocaleTimeString("en-GB"),
          message: `Unknown command: ${cmd}`,
          level: "error",
        };
      }

      setHistory((prev) => [...prev, inputEntry, response]);
    };

    return (
      <CommandTerminal
        history={history}
        onCommand={handleCommand}
        label="TERMINAL"
        code="007"
      />
    );
  },
};

export const WithBootSequence: Story = {
  args: {
    label: "TERMINAL",
    code: "001",
    bootSequence: [
      "NERV CENTRAL DOGMA TERMINAL v3.14.159",
      "Initializing MAGI interface...",
      "MELCHIOR-1 ... OK",
      "BALTHASAR-2 ... OK",
      "CASPER-3 ... OK",
      "All systems nominal. Ready for input.",
    ],
    history: [],
  },
};

export const Disabled: Story = {
  args: {
    label: "TERMINAL",
    disabled: true,
    history: [
      {
        id: "1",
        timestamp: "12:00:01",
        message: "Connection lost.",
        level: "error",
      },
      {
        id: "2",
        timestamp: "12:00:02",
        message: "Terminal locked by MAGI override.",
        level: "system",
      },
    ],
  },
};

export const ErrorState: Story = {
  args: {
    label: "TERMINAL",
    code: "ERR",
    history: [
      {
        id: "1",
        timestamp: "23:59:01",
        message: "CRITICAL: Core containment failure",
        level: "error",
      },
      {
        id: "2",
        timestamp: "23:59:02",
        message: "CRITICAL: LCL pressure exceeding limits",
        level: "error",
      },
      {
        id: "3",
        timestamp: "23:59:03",
        message: "WARNING: Initiating emergency protocol",
        level: "system",
      },
      {
        id: "4",
        timestamp: "23:59:04",
        message: "ABORT: All operations suspended",
        level: "error",
      },
    ],
  },
};
