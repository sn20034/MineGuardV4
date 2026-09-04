export function classifyRisk(tilt, vibration, displacement, crack) {
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

  // Crack detection
  if (crack === 1) score += 30;

  let status = "normal";

  if (score >= 80) status = "critical";
  else if (score >= 60) status = "warning";
  else if (score >= 30) status = "watch";

  return { score, status };
}
