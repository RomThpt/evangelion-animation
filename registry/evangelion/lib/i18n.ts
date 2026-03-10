import type { EvaLocale } from "../provider/types";

export type LabelMap = Record<string, { ja: string; en: string }>;

/**
 * Returns localized label.
 * In "ja" mode, components typically show both Japanese primary + small English subtitle.
 * In "en" mode, English only.
 */
export function t(labels: LabelMap, key: string, locale: EvaLocale): string {
  const entry = labels[key];
  if (!entry) return key;
  return entry[locale];
}

/** Returns both ja and en for dual-label display */
export function tDual(labels: LabelMap, key: string): { ja: string; en: string } {
  return labels[key] ?? { ja: key, en: key };
}

export const commonLabels: LabelMap = {
  syncRate: { ja: "\u540C\u671F\u7387", en: "SYNC RATE" },
  status: { ja: "\u72B6\u614B", en: "STATUS" },
  online: { ja: "\u7A3C\u50CD\u4E2D", en: "ACTIVE" },
  standby: { ja: "\u5F85\u6A5F", en: "STANDBY" },
  offline: { ja: "\u5207\u65AD", en: "OFFLINE" },
  error: { ja: "\u7570\u5E38", en: "ERROR" },
  warning: { ja: "\u8B66\u544A", en: "WARNING" },
  emergency: { ja: "\u7DCA\u6025", en: "EMERGENCY" },
  caution: { ja: "\u6CE8\u610F", en: "CAUTION" },
  normal: { ja: "\u901A\u5E38", en: "NORMAL" },
  depth: { ja: "\u6DF1\u5EA6", en: "DEPTH" },
  contamination: { ja: "\u6C5A\u67D3\u5EA6", en: "CONTAMINATION" },
  heartRate: { ja: "\u5FC3\u62CD", en: "HEART RATE" },
  neuralLink: { ja: "\u795E\u7D4C\u63A5\u7D9A", en: "NEURAL LINK" },
  pattern: { ja: "\u30D1\u30BF\u30FC\u30F3", en: "PATTERN" },
  blue: { ja: "\u30D6\u30EB\u30FC", en: "BLUE" },
  orange: { ja: "\u30AA\u30EC\u30F3\u30B8", en: "ORANGE" },
  confirmed: { ja: "\u78BA\u8A8D", en: "CONFIRMED" },
  unconfirmed: { ja: "\u672A\u78BA\u8A8D", en: "UNCONFIRMED" },
  target: { ja: "\u76EE\u6A19", en: "TARGET" },
  distance: { ja: "\u8DDD\u96E2", en: "DISTANCE" },
  locked: { ja: "\u30ED\u30C3\u30AF", en: "LOCKED" },
  elapsed: { ja: "\u7D4C\u904E", en: "ELAPSED" },
  remaining: { ja: "\u6B8B\u308A", en: "REMAINING" },
  system: { ja: "\u30B7\u30B9\u30C6\u30E0", en: "SYSTEM" },
  log: { ja: "\u30ED\u30B0", en: "LOG" },
  info: { ja: "\u60C5\u5831", en: "INFO" },
  power: { ja: "\u96FB\u529B", en: "POWER" },
  activation: { ja: "\u8D77\u52D5", en: "ACTIVATION" },
  signal: { ja: "\u4FE1\u53F7", en: "SIGNAL" },
  analysis: { ja: "\u89E3\u6790", en: "ANALYSIS" },
  connection: { ja: "\u63A5\u7D9A", en: "CONNECTION" },
  pressure: { ja: "\u5727\u529B", en: "PRESSURE" },
  temperature: { ja: "\u6E29\u5EA6", en: "TEMP" },
  output: { ja: "\u51FA\u529B", en: "OUTPUT" },
  input: { ja: "\u5165\u529B", en: "INPUT" },
  field: { ja: "\u30D5\u30A3\u30FC\u30EB\u30C9", en: "FIELD" },
  integrity: { ja: "\u5B8C\u5168\u6027", en: "INTEGRITY" },
  breach: { ja: "\u4FB5\u5165", en: "BREACH" },
  operational: { ja: "\u4F5C\u6226\u4E2D", en: "OPERATIONAL" },
  initializing: { ja: "\u521D\u671F\u5316\u4E2D", en: "INITIALIZING" },
  complete: { ja: "\u5B8C\u4E86", en: "COMPLETE" },
  abort: { ja: "\u4E2D\u6B62", en: "ABORT" },
  execute: { ja: "\u5B9F\u884C", en: "EXECUTE" },
  magi: { ja: "MAGI\u30B7\u30B9\u30C6\u30E0", en: "MAGI SYSTEM" },
  entry: { ja: "\u30A8\u30F3\u30C8\u30EA\u30FC", en: "ENTRY" },
  plug: { ja: "\u30D7\u30E9\u30B0", en: "PLUG" },
  pilot: { ja: "\u30D1\u30A4\u30ED\u30C3\u30C8", en: "PILOT" },
  evangelion: { ja: "\u30A8\u30F4\u30A1\u30F3\u30B2\u30EA\u30AA\u30F3", en: "EVANGELION" },
  // MAGI
  magiConsensus: { ja: "\u5408\u8B70", en: "CONSENSUS" },
  approve: { ja: "\u627F\u8A8D", en: "APPROVE" },
  deny: { ja: "\u5426\u6C7A", en: "DENY" },
  abstain: { ja: "\u68C4\u6A29", en: "ABSTAIN" },
  processing: { ja: "\u51E6\u7406\u4E2D", en: "PROCESSING" },
  unanimous: { ja: "\u5168\u4F1A\u4E00\u81F4", en: "UNANIMOUS" },
  majority: { ja: "\u591A\u6570\u6C7A", en: "MAJORITY" },
  confidence: { ja: "\u4FE1\u983C\u5EA6", en: "CONFIDENCE" },
  // Radar
  radar: { ja: "\u30EC\u30FC\u30C0\u30FC", en: "RADAR" },
  bearing: { ja: "\u65B9\u4F4D", en: "BEARING" },
  hostile: { ja: "\u6575\u6027", en: "HOSTILE" },
  friendly: { ja: "\u53CB\u8ECD", en: "FRIENDLY" },
  // Spectrum
  spectrum: { ja: "\u5468\u6CE2\u6570\u89E3\u6790", en: "SPECTRUM" },
  frequency: { ja: "\u5468\u6CE2\u6570", en: "FREQUENCY" },
  amplitude: { ja: "\u632F\u5E45", en: "AMPLITUDE" },
  // Terminal / Camera / Power / LCL
  terminal: { ja: "\u7AEF\u672B", en: "TERMINAL" },
  command: { ja: "\u30B3\u30DE\u30F3\u30C9", en: "COMMAND" },
  ready: { ja: "\u6E96\u5099\u5B8C\u4E86", en: "READY" },
  camera: { ja: "\u30AB\u30E1\u30E9", en: "CAMERA" },
  recording: { ja: "\u9332\u753B\u4E2D", en: "RECORDING" },
  noSignal: { ja: "\u4FE1\u53F7\u306A\u3057", en: "NO SIGNAL" },
  live: { ja: "\u30E9\u30A4\u30D6", en: "LIVE" },
  umbilical: { ja: "\u30A2\u30F3\u30D3\u30EA\u30AB\u30EB", en: "UMBILICAL" },
  battery: { ja: "\u30D0\u30C3\u30C6\u30EA\u30FC", en: "BATTERY" },
  severed: { ja: "\u5207\u65AD", en: "SEVERED" },
  load: { ja: "\u8CA0\u8377", en: "LOAD" },
  lcl: { ja: "LCL\u6DB2", en: "LCL FLUID" },
  fillLevel: { ja: "\u5145\u586B\u91CF", en: "FILL LEVEL" },
};

/**
 * Eva-style technical formatting.
 * Wraps a label in the characteristic bracket/prefix format.
 *
 * Examples:
 *   formatLabel("SYNC RATE", "ja", "同期率")  =>  "[ 同期率 ] SYNC RATE"
 *   formatLabel("SYNC RATE", "en")             =>  "SYNC RATE"
 *   formatBlock("001", "MAGI")                 =>  ">>>001:MAGI"
 */
export function formatLabel(en: string, locale: EvaLocale, ja?: string): string {
  if (locale === "ja" && ja) {
    return `[ ${ja} ] ${en}`;
  }
  return en;
}

export function formatBlock(code: string, label: string): string {
  return `>>>${code}:${label}`;
}

export function formatHex(n: number, digits = 4): string {
  return `0x${n.toString(16).toUpperCase().padStart(digits, "0")}`;
}

export function formatMemAddr(segment: number, offset: number): string {
  return `${segment.toString(16).toUpperCase().padStart(4, "0")}:${offset.toString(16).toUpperCase().padStart(4, "0")}`;
}
