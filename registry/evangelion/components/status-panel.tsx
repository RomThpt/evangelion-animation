import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { Scanlines } from "../primitives/scanlines";
import { DURATION, EASING } from "../lib/animation-presets";

export type StatusPanelStatus = "online" | "standby" | "offline" | "error";

export interface StatusPanelProps {
  title: string;
  status?: StatusPanelStatus;
  children?: ReactNode;
  bordered?: boolean;
  headerPosition?: "top" | "left";
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

const statusColors: Record<StatusPanelStatus, string> = {
  online: "bg-eva-primary",
  standby: "bg-eva-text-dim",
  offline: "bg-eva-text-dim opacity-40",
  error: "bg-red-500",
};

export function StatusPanel({
  title,
  status = "online",
  children,
  bordered = true,
  headerPosition = "top",
  collapsible = false,
  defaultOpen = true,
  className,
}: StatusPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const borderRef = useRef<SVGRectElement>(null);
  const { reducedMotion } = useEva();

  useEffect(() => {
    if (!borderRef.current || !bordered || reducedMotion) return;

    const rect = borderRef.current;
    const length = rect.getTotalLength();
    rect.style.strokeDasharray = `${length}`;
    rect.style.strokeDashoffset = `${length}`;

    const scope = createScope({ root: rect.closest("svg")! });
    scope.add(() => {
      animate(rect, {
        strokeDashoffset: [length, 0],
        duration: DURATION.boot,
        ease: EASING.structural,
      });
    });

    return () => scope.revert();
  }, [bordered, reducedMotion]);

  return (
    <div
      className={cn(
        "relative font-mono",
        headerPosition === "left" && "flex",
        className,
      )}
    >
      {bordered && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <rect
            ref={borderRef}
            x="0.5"
            y="0.5"
            width="calc(100% - 1px)"
            height="calc(100% - 1px)"
            fill="none"
            stroke="var(--eva-border)"
            strokeWidth="1"
          />
        </svg>
      )}

      <div
        className={cn(
          "flex items-center gap-2 border-b border-eva-border px-3 py-2",
          collapsible && "cursor-pointer select-none",
          headerPosition === "left" && "border-b-0 border-r",
        )}
        onClick={collapsible ? () => setIsOpen((o) => !o) : undefined}
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        onKeyDown={
          collapsible
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsOpen((o) => !o);
                }
              }
            : undefined
        }
      >
        <div
          className={cn(
            "h-2 w-2 shrink-0",
            statusColors[status],
            status === "online" && "animate-[eva-pulse_2s_ease-in-out_infinite]",
            status === "error" && "animate-[eva-pulse_0.5s_steps(1)_infinite]",
          )}
        />
        <TypeWriter
          text={title}
          className="text-xs uppercase tracking-wider text-eva-text-dim"
          cursor={false}
        />
        {collapsible && (
          <span className="ml-auto text-xs text-eva-text-dim">
            {isOpen ? "[-]" : "[+]"}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative p-3">
              {children}
              <Scanlines />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
