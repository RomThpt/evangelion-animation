import { cn } from "../lib/utils";
import { useNumberRoll } from "../hooks/use-number-roll";

export interface NumberRollProps {
  value: number;
  className?: string;
  precision?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export function NumberRoll({
  value,
  className,
  precision = 0,
  duration,
  prefix = "",
  suffix = "",
}: NumberRollProps) {
  const displayValue = useNumberRoll({ value, precision, duration });

  return (
    <span
      className={cn(
        "inline-block font-mono tabular-nums text-eva-text",
        className,
      )}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
