import { Cpu, ArrowDown, ShieldAlert, Bell } from "lucide-react";
import type { SensorReading } from "../lib/types";

interface SensorFusionProps {
  reading: SensorReading | null;
}

export function SensorFusion({ reading }: SensorFusionProps) {
  const inputs = [
    { label: "Tilt", value: reading?.tilt ?? 0, unit: "°", color: "cyan" },
    { label: "Displacement", value: reading?.displacement ?? 0, unit: "mm", color: "teal" },
    { label: "Vibration", value: reading?.vibration ?? 0, unit: "Hz", color: "blue" },
    { label: "Crack", value: reading?.crack ?? 0, unit: "", color: "rose" },
  ];

  const stages = [
    { label: "AI/ML Engine", desc: "Multi-sensor fusion & pattern recognition", icon: Cpu, color: "cyan", bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
    { label: "Risk Assessment", desc: "Weighted scoring & threshold classification", icon: ShieldAlert, color: "amber", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
    { label: "Early Warning", desc: "Alert dispatch & response recommendations", icon: Bell, color: "rose", bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400" },
  ];

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Sensor Fusion</h3>

      <div className="flex flex-wrap gap-2 mb-5">
        {inputs.map((inp) => (
          <div
            key={inp.label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${inp.color}-500/10 border border-${inp.color}-500/20`}
          >
            <span className={`w-2 h-2 rounded-full bg-${inp.color}-400 animate-pulse`} style={{ animationDuration: "2s" }} />
            <span className="text-xs font-medium text-slate-300">{inp.label}</span>
            <span className={`text-xs font-mono tabular-nums text-${inp.color}-400`}>
              {inp.value.toFixed(inp.label === "Crack" ? 0 : 2)}{inp.unit}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <div key={stage.label} className="w-full flex flex-col items-center">
              <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${stage.bg} border ${stage.border} transition-all duration-300 hover:scale-[1.02]`}>
                <div className={`w-9 h-9 rounded-lg ${stage.bg} flex items-center justify-center border ${stage.border}`}>
                  <Icon className={`w-4.5 h-4.5 ${stage.text}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${stage.text}`}>{stage.label}</div>
                  <div className="text-[11px] text-slate-500">{stage.desc}</div>
                </div>
              </div>
              {i < stages.length - 1 && (
                <ArrowDown className="w-4 h-4 text-slate-600 my-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
