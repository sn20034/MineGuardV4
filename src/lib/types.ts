export type SensorStatus = "normal" | "watch" | "warning" | "critical";

export interface SensorReading {
  nodeId: string;
  tilt: number;
  vibration: number;
  displacement: number;
  crack: number;
  status: SensorStatus;
  timestamp: string;
}

export interface ReadingRecord {
  id: string;
  node_id: string;
  tilt: number;
  vibration: number;
  displacement: number;
  crack: number;
  status: SensorStatus;
  score: number;
  timestamp: string;
}

export interface AlertRecord {
  id: string;
  node_id: string;
  tilt: number;
  vibration: number;
  displacement: number;
  crack: number;
  status: SensorStatus;
  score: number;
  timestamp: string;
}

export interface NodeRecord {
  id: string;
  node_id: string;
  latitude: number;
  longitude: number;
  status: SensorStatus;
  last_reading: SensorReading | null;
  created_at: string;
  updated_at: string;
}

export interface RiskResult {
  score: number;
  status: SensorStatus;
}

export function classifyRisk(
  tilt: number,
  vibration: number,
  displacement: number,
  crack: number,
): RiskResult {
  let score = 0;

  // Tilt
  if (tilt > 1.5) score += 30;
  else if (tilt > 0.8) score += 15;

  // Vibration
  if (vibration > 30) score += 25;
  else if (vibration > 10) score += 10;

  // Displacement
  if (displacement > 3.0) score += 25;
  else if (displacement > 1.5) score += 10;

  // Crack
  if (crack === 1) score += 30;

  let status: SensorStatus = "normal";

  if (score >= 80) status = "critical";
  else if (score >= 60) status = "warning";
  else if (score >= 30) status = "watch";

  return { score, status };
}

export const STATUS_CONFIG: Record<
  SensorStatus,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    text: string;
    dot: string;
    hex: string;
  }
> = {
  normal: {
    label: "NORMAL",
    color: "emerald",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    hex: "#10b981",
  },
  watch: {
    label: "WATCH",
    color: "amber",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    hex: "#f59e0b",
  },
  warning: {
    label: "WARNING",
    color: "orange",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    dot: "bg-orange-400",
    hex: "#f97316",
  },
  critical: {
    label: "CRITICAL",
    color: "red",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    hex: "#ef4444",
  },
};
