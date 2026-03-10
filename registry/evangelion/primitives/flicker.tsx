import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { useFlicker, type UseFlickerOptions } from "../hooks/use-flicker";

export interface FlickerProps extends UseFlickerOptions {
  children: ReactNode;
  className?: string;
}

export function Flicker({
  children,
  className,
  ...flickerOptions
}: FlickerProps) {
  const opacity = useFlicker(flickerOptions);

  return (
    <span className={cn("inline-block", className)} style={{ opacity }}>
      {children}
    </span>
  );
}
