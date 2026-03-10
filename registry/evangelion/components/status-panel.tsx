import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animate, createScope } from "animejs";
import { cn } from "../lib/utils";
import { useEva } from "../provider/eva-context";
import { TypeWriter } from "../primitives/type-writer";
import { Scanlines } from "../primitives/scanlines";
import { Flicker } from "../primitives/flicker";
import { formatLabel, formatBlock, tDual, commonLabels } from "../lib/i18n";
import { DURATION, EASING } from "../lib/animation-presets";

export type StatusPanelStatus = "online" | "standby" | "offline" | "error";

export interface StatusPanelProps {
  title: string;
  /** override Japanese title -- if omitted, tries commonLabels lookup */
  titleJa?: string;
  /** technical block code shown in header, e.g. "001" */
  code?: string;
  status?: StatusPanelStatus;
  children?: ReactNode;
  bordered?: boolean;
  headerPosition?: "top" | "left";
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

export function StatusPanel({
  title,
  titleJa,
  code,
  status = "online",
  children,
  bordered = true,
  headerPosition = "top",
  collapsible = false,
  defaultOpen = true,
  className,
}: StatusPanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const borderRef = useRef<SVGPathElement>(null);
  const { locale, reducedMotion } = useEva();

  const labels = tDual(commonLabels, title.toLowerCase());
  const jaText = titleJa ?? labels.ja;
  const displayTitle = formatLabel(title, locale, jaText !== title.toLowerCase() ? jaText : undefined);

  useEffect(() => {
    if (!borderRef.current || !bordered || reducedMotion) return;

    const path = borderRef.current;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const scope = createScope({ root: path.closest("svg")! });
    scope.add(() => {
      animate(path, {
        strokeDashoffset: [length, 0],
        duration: DURATION.boot * 1.2,
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
      {/* angular border with clipped corners */}
      {bordered && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <path
            ref={borderRef}
            d="M8,0 L100%,0 L100%,calc(100% - 8px) L calc(100% - 8px),100% L0,100% L0,8 Z"
            fill="none"
            stroke="var(--eva-border)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {/* header */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-1.5",
          "border-b border-eva-border",
          collapsible && "cursor-pointer select-none",
          headerPosition === "left" && "flex-col border-b-0 border-r py-3",
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
        {/* status pip */}
        <Flicker intensity={status === "error" ? "heavy" : "subtle"}>
          <div
            className={cn(
              "h-1.5 w-1.5",
              status === "online" && "bg-[var(--eva-primary)] shadow-[0_0_4px_var(--eva-glow)]",
              status === "standby" && "bg-eva-text-dim",
              status === "offline" && "bg-[var(--eva-text-muted,var(--eva-text-dim))]",
              status === "error" && "bg-red-500 shadow-[0_0_6px_rgba(255,0,0,0.6)]",
            )}
          />
        </Flicker>

        {/* block code */}
        {code && (
          <span className="text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
            {formatBlock(code, "")}
          </span>
        )}

        {/* title */}
        <TypeWriter
          text={displayTitle}
          className="eva-label text-[10px]"
          speed={25}
          cursor={false}
          jitter
        />

        {collapsible && (
          <span className="ml-auto text-[9px] text-[var(--eva-text-muted,var(--eva-text-dim))]">
            {isOpen ? "[-]" : "[+]"}
          </span>
        )}
      </div>

      {/* content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="relative p-2">
              {children}
              <Scanlines intensity="subtle" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
