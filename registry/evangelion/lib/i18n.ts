import type { EvaLocale } from "../provider/types";

export type LabelMap = Record<string, { ja: string; en: string }>;

export function t(labels: LabelMap, key: string, locale: EvaLocale): string {
  const entry = labels[key];
  if (!entry) return key;
  return entry[locale];
}

export const commonLabels: LabelMap = {
  syncRate: { ja: "同期率", en: "SYNC RATE" },
  status: { ja: "状態", en: "STATUS" },
  online: { ja: "稼働中", en: "ONLINE" },
  standby: { ja: "待機中", en: "STANDBY" },
  offline: { ja: "切断", en: "OFFLINE" },
  error: { ja: "異常", en: "ERROR" },
  warning: { ja: "警告", en: "WARNING" },
  emergency: { ja: "緊急", en: "EMERGENCY" },
  caution: { ja: "注意", en: "CAUTION" },
  normal: { ja: "通常", en: "NORMAL" },
  depth: { ja: "深度", en: "DEPTH" },
  contamination: { ja: "汚染", en: "CONTAMINATION" },
  heartRate: { ja: "心拍数", en: "HEART RATE" },
  neuralLink: { ja: "神経接続", en: "NEURAL LINK" },
  pattern: { ja: "パターン", en: "PATTERN" },
  blue: { ja: "ブルー", en: "BLUE" },
  orange: { ja: "オレンジ", en: "ORANGE" },
  confirmed: { ja: "確認", en: "CONFIRMED" },
  unconfirmed: { ja: "未確認", en: "UNCONFIRMED" },
  target: { ja: "目標", en: "TARGET" },
  distance: { ja: "距離", en: "DISTANCE" },
  locked: { ja: "ロック", en: "LOCKED" },
  elapsed: { ja: "経過", en: "ELAPSED" },
  remaining: { ja: "残り", en: "REMAINING" },
  system: { ja: "システム", en: "SYSTEM" },
  log: { ja: "ログ", en: "LOG" },
  info: { ja: "情報", en: "INFO" },
};
