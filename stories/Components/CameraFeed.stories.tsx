import type { Meta, StoryObj } from "@storybook/react";
import { CameraFeed } from "../../registry/evangelion/components/camera-feed";
import { withEvaProvider } from "../../.storybook/eva-decorator";

const meta: Meta<typeof CameraFeed> = {
  title: "Components/CameraFeed",
  component: CameraFeed,
  decorators: [withEvaProvider],
};
export default meta;

type Story = StoryObj<typeof CameraFeed>;

export const Live: Story = {
  render: () => (
    <CameraFeed
      cameraId="01"
      status="live"
      signalStrength={92}
      timestamp="2015/06/22 14:32:07"
    >
      <div className="flex h-full items-center justify-center text-[var(--eva-text-dim)] text-xs font-mono">
        LIVE FEED CONTENT
      </div>
    </CameraFeed>
  ),
};

export const Recording: Story = {
  render: () => (
    <CameraFeed
      cameraId="03"
      status="recording"
      signalStrength={85}
      timestamp="2015/06/22 14:32:07"
    >
      <div className="flex h-full items-center justify-center text-[var(--eva-text-dim)] text-xs font-mono">
        RECORDING ACTIVE
      </div>
    </CameraFeed>
  ),
};

export const Offline: Story = {
  args: {
    cameraId: "07",
    status: "offline",
    signalStrength: 0,
  },
};

export const Paused: Story = {
  args: {
    cameraId: "02",
    status: "paused",
    signalStrength: 75,
    timestamp: "2015/06/22 14:30:00",
  },
};

export const WeakSignal: Story = {
  render: () => (
    <CameraFeed
      cameraId="12"
      status="live"
      signalStrength={15}
      timestamp="2015/06/22 14:32:07"
    >
      <div className="flex h-full items-center justify-center text-[var(--eva-text-dim)] text-xs font-mono">
        WEAK SIGNAL FEED
      </div>
    </CameraFeed>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4" style={{ maxWidth: 700 }}>
      <CameraFeed
        cameraId="01"
        status="live"
        signalStrength={95}
        timestamp="14:32:07"
      >
        <div className="flex h-full items-center justify-center text-[var(--eva-text-dim)] text-xs">
          SECTOR A
        </div>
      </CameraFeed>
      <CameraFeed
        cameraId="02"
        status="recording"
        signalStrength={88}
        timestamp="14:32:07"
      >
        <div className="flex h-full items-center justify-center text-[var(--eva-text-dim)] text-xs">
          SECTOR B
        </div>
      </CameraFeed>
      <CameraFeed cameraId="03" status="offline" signalStrength={0} />
      <CameraFeed
        cameraId="04"
        status="paused"
        signalStrength={60}
        timestamp="14:30:00"
      />
    </div>
  ),
};
