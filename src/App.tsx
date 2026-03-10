import { EvaProvider } from "@/registry/evangelion/provider/eva-provider";
import { GlowText } from "@/registry/evangelion/primitives/glow-text";
import { Flicker } from "@/registry/evangelion/primitives/flicker";
import { TypeWriter } from "@/registry/evangelion/primitives/type-writer";
import { Scanlines } from "@/registry/evangelion/primitives/scanlines";

export default function App() {
  return (
    <EvaProvider palette="normal" locale="ja">
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-4">
        <Flicker intensity="subtle">
          <GlowText className="text-3xl tracking-[0.5em]" intensity="high">
            EVANGELION UI
          </GlowText>
        </Flicker>
        <div className="h-px w-48 bg-eva-border" />
        <TypeWriter
          text={"\u30B3\u30F3\u30DD\u30FC\u30CD\u30F3\u30C8\u30E9\u30A4\u30D6\u30E9\u30EA COMPONENT LIBRARY"}
          className="text-[10px] tracking-[0.2em] text-eva-text-dim"
          speed={30}
          jitter
        />
        <p className="mt-8 text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
          npm run storybook
        </p>
        <Scanlines intensity="subtle" />
      </div>
    </EvaProvider>
  );
}
