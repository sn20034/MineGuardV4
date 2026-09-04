import type { SensorReading } from "./types";

export interface ThresholdConfig {
  tilt: number;
  vibration: number;
  displacement: number;
  crack: number;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  tilt: 1.5,
  vibration: 30,
  displacement: 3.0,
  crack: 1,
};

export interface ThresholdBreach {
  field: "tilt" | "vibration" | "displacement" | "crack";
  label: string;
  value: number;
  threshold: number;
  unit: string;
}

export function checkThresholds(
  reading: SensorReading,
  thresholds: ThresholdConfig = DEFAULT_THRESHOLDS
): ThresholdBreach[] {
  const breaches: ThresholdBreach[] = [];

  if (reading.tilt > thresholds.tilt) {
    breaches.push({ field: "tilt", label: "Tilt", value: reading.tilt, threshold: thresholds.tilt, unit: "°" });
  }
  if (reading.vibration > thresholds.vibration) {
    breaches.push({ field: "vibration", label: "Vibration", value: reading.vibration, threshold: thresholds.vibration, unit: "Hz" });
  }
  if (reading.displacement > thresholds.displacement) {
    breaches.push({ field: "displacement", label: "Displacement", value: reading.displacement, threshold: thresholds.displacement, unit: "mm" });
  }
  if (reading.crack >= thresholds.crack) {
    breaches.push({ field: "crack", label: "Crack", value: reading.crack, threshold: thresholds.crack, unit: "" });
  }

  return breaches;
}
