import { EvaProvider } from "@/registry/evangelion/provider/eva-provider";
import { GlowText } from "@/registry/evangelion/primitives/glow-text";

export default function App() {
  return (
    <EvaProvider palette="normal" locale="ja">
      <div className="flex min-h-screen items-center justify-center">
        <GlowText className="text-4xl">EVANGELION UI</GlowText>
      </div>
    </EvaProvider>
  );
}
