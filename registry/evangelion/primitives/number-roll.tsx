import { cn } from "../lib/utils";
import { useNumberRoll } from "../hooks/use-number-roll";

export interface NumberRollProps {
  value: number;
  className?: string;
  precision?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  /** pad with leading zeros (e.g. padTo=3: "007") */
  padTo?: number;
}

export function NumberRoll({
  value,
  className,
  precision = 0,
  duration,
  prefix = "",
  suffix = "",
  padTo = 0,
}: NumberRollProps) {
  const raw = useNumberRoll({ value, precision, duration });

  const display = padTo > 0
    ? raw.split(".").map((part, i) =>
        i === 0 ? part.padStart(padTo, "0") : part
      ).join(".")
    : raw;

  return (
    <span
      className={cn(
        "eva-value inline-block font-mono tabular-nums text-eva-text",
        className,
      )}
      style={{
        textShadow: "0 0 2px var(--eva-glow), 0 0 6px var(--eva-glow-subtle, var(--eva-glow))",
      }}
    >
      {prefix && <span className="text-eva-text-dim">{prefix}</span>}
      {display}
      {suffix && <span className="ml-[0.15em] text-[0.7em] text-eva-text-dim">{suffix}</span>}
    </span>
  );
}
