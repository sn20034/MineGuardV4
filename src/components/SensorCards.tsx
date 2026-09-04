import {
  ArrowUp,
  ArrowDown,
  Minus,
  Gauge,
  Radio,
  Ruler,
  AlertCircle,
} from "lucide-react";

import type { SensorReading } from "../lib/types";
import { useState, useEffect, useRef } from "react";

interface SensorCardsProps {
  reading: SensorReading | null;
}

interface CardData {
  label: string;
  unit: string;
  value: number;
  icon: typeof Gauge;
  simulated?: boolean;
  color: string;
}

function TrendArrow({
  current,
  previous,
}: {
  current: number;
  previous: number | undefined;
}) {
  if (previous === undefined) {
    return <Minus className="w-3.5 h-3.5 text-slate-600" />;
  }

  if (Math.abs(current - previous) < 0.01) {
    return <Minus className="w-3.5 h-3.5 text-slate-500" />;
  }

  return current > previous ? (
    <ArrowUp className="w-3.5 h-3.5 text-red-400" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
  );
}

export function SensorCards({ reading }: SensorCardsProps) {
  const prevRef = useRef<SensorReading | null>(null);
  const [prev, setPrev] = useState<SensorReading | null>(null);

  useEffect(() => {
    if (reading) {
      setPrev(prevRef.current);
      prevRef.current = reading;
    }
  }, [reading]);

  const cards: CardData[] = [
    {
      label: "Tilt",
      unit: "°",
      value: reading?.tilt ?? 0,
      icon: Gauge,
      simulated: true,
      color: "cyan",
    },
    {
      label: "Vibration",
      unit: "Hz",
      value: reading?.vibration ?? 0,
      icon: Radio,
      simulated: true,
      color: "blue",
    },
    {
      label: "Displacement",
      unit: "mm",
      value: reading?.displacement ?? 0,
      icon: Ruler,
      color: "teal",
    },
    {
      label: "Crack Width",
      unit: "mm",
      value: reading?.crack ?? 0,
      icon: AlertCircle,
      color: "rose",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        const prevVal = prev
          ? card.label === "Tilt"
            ? prev.tilt
            : card.label === "Vibration"
              ? prev.vibration
              : card.label === "Displacement"
                ? prev.displacement
                : prev.crack
          : undefined;

        const percentage =
          card.label === "Crack Width"
            ? card.value > 0
              ? 100
              : 0
            : Math.min(
                100,
                (card.value /
                  (card.label === "Tilt"
                    ? 2.5
                    : card.label === "Vibration"
                      ? 50
                      : 5)) *
                  100,
              );

        return (
          <div
            key={card.label}
            className="relative rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 sm:p-4 hover:border-slate-700/60 transition-all duration-200 group"
          >
            {/* TOP */}
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-8 h-8 shrink-0 rounded-lg bg-${card.color}-500/10 flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 text-${card.color}-400`} />
                </div>

                <span className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">
                  {card.label}
                </span>
              </div>

              {card.simulated && (
                <span
                  className="shrink-0 text-[8px] sm:text-[9px] font-semibold uppercase tracking-wider text-slate-600 border border-slate-700/50 rounded px-1.5 py-0.5"
                  title="Simulated data — real MPU6050/vibration sensor not yet connected"
                >
                  SIM
                </span>
              )}
            </div>

            {/* VALUE */}
            <div className="flex items-end justify-between">
              <div className="flex items-baseline gap-1 min-w-0">
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums tracking-tight">
                  {card.value.toFixed(card.label === "Crack Width" ? 0 : 2)}
                </span>

                <span className="text-[10px] sm:text-xs text-slate-500">
                  {card.unit}
                </span>
              </div>

              <TrendArrow current={card.value} previous={prevVal} />
            </div>

            {/* PROGRESS */}
            <div className="mt-2 h-1 rounded-full bg-slate-800/60 overflow-hidden">
              <div
                className={`h-full bg-${card.color}-400/60 rounded-full transition-all duration-500`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
