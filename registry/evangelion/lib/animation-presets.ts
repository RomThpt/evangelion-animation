export const EASING = {
  dataChange: "out(3)",
  structural: "inOut(3)",
  alert: "linear",
  breathing: "inOut(1)",
  spring: "spring(1, 80, 10, 0)",
} as const;

export const DURATION = {
  boot: 1000,
  valueChange: 400,
  alertFlash: 200,
  idlePulse: 3000,
  typewriterChar: 40,
  numberRollDigit: 200,
  staggerElement: 80,
} as const;

export const STAGGER = {
  boot: 60,
  grid: 100,
  cascade: 50,
} as const;

export interface AnimationPreset {
  duration: number;
  ease: string;
  delay?: number;
}

export const presets = {
  dataChange: { duration: DURATION.valueChange, ease: EASING.dataChange },
  structural: { duration: DURATION.boot, ease: EASING.structural },
  alert: { duration: DURATION.alertFlash, ease: EASING.alert },
  breathing: { duration: DURATION.idlePulse, ease: EASING.breathing },
} as const satisfies Record<string, AnimationPreset>;
