import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NotificationBanner } from "../../registry/evangelion/components/notification-banner";
import type { NotificationItem } from "../../registry/evangelion/components/notification-banner";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof NotificationBanner> = {
  title: "Components/NotificationBanner",
  component: NotificationBanner,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof NotificationBanner>;

export const Info: Story = {
  args: {
    notifications: [
      { id: "1", message: "System diagnostic complete. All subsystems nominal.", level: "info", duration: 5000 },
    ],
  },
};

export const Caution: Story = {
  args: {
    notifications: [
      { id: "1", message: "Synchronization rate dropping below threshold.", level: "caution", duration: 8000, code: "C-201" },
    ],
  },
};

export const Warning: Story = {
  args: {
    notifications: [
      { id: "1", message: "AT Field integrity compromised. Immediate action required.", level: "warning", duration: 10000, code: "W-401" },
    ],
  },
};

export const Emergency: Story = {
  args: {
    notifications: [
      { id: "1", message: "PATTERN BLUE DETECTED. All personnel to battle stations.", level: "emergency", duration: 0, code: "E-001" },
    ],
  },
};

export const Stacked: Story = {
  args: {
    notifications: [
      { id: "1", message: "Routine maintenance scheduled.", level: "info", duration: 5000 },
      { id: "2", message: "Power fluctuation detected in sector 7.", level: "caution", duration: 8000, code: "C-107" },
      { id: "3", message: "Neural link degradation detected.", level: "warning", duration: 10000, code: "W-303" },
    ],
    maxVisible: 5,
  },
};

export const Interactive: Story = {
  render: () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [nextId, setNextId] = useState(1);
    const levels = ["info", "caution", "warning", "emergency"] as const;
    const messages = [
      "Diagnostic scan complete.",
      "Sync rate fluctuation detected.",
      "AT Field breach in sector 4.",
      "ANGEL approaching. Initiate combat protocol.",
    ];

    const addNotification = () => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const msg = messages[levels.indexOf(level)];
      setNotifications(prev => [...prev, {
        id: String(nextId),
        message: msg,
        level,
        duration: 6000,
        code: `${level[0].toUpperCase()}-${String(nextId).padStart(3, "0")}`,
      }]);
      setNextId(prev => prev + 1);
    };

    return (
      <div>
        <NotificationBanner
          notifications={notifications}
          onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
          maxVisible={4}
        />
        <button onClick={addNotification} className="border border-[var(--eva-border)] px-3 py-1 font-mono text-xs text-[var(--eva-text)]">
          ADD NOTIFICATION
        </button>
      </div>
    );
  },
};

export const BottomEdge: Story = {
  args: {
    edge: "bottom",
    notifications: [
      { id: "1", message: "Bottom edge notification test.", level: "info", duration: 0 },
      { id: "2", message: "Secondary notification from bottom.", level: "caution", duration: 0, code: "C-100" },
    ],
  },
};
