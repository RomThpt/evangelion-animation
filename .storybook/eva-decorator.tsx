import type { ReactNode } from "react";
import { EvaProvider } from "../registry/evangelion/provider/eva-provider";
import type { EvaPalette, EvaLocale } from "../registry/evangelion/provider/types";

interface DecoratorContext {
  globals: {
    palette?: EvaPalette;
    locale?: EvaLocale;
  };
}

export function withEvaProvider(
  Story: () => ReactNode,
  context: DecoratorContext,
) {
  const palette = context.globals.palette ?? "normal";
  const locale = context.globals.locale ?? "ja";

  return (
    <EvaProvider palette={palette} locale={locale}>
      <div className="p-8">
        <Story />
      </div>
    </EvaProvider>
  );
}
