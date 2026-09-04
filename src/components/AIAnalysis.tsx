import { STATUS_CONFIG, type SensorReading } from "../lib/types";
import { Brain } from "lucide-react";

interface AIAnalysisProps {
  reading: SensorReading | null;
}

export function AIAnalysis({ reading }: AIAnalysisProps) {
  const status = reading?.status ?? "normal";
  const config = STATUS_CONFIG[status];

  // Compute anomaly score 0.00-1.00 from reading values
  const tiltScore = Math.min(1, (reading?.tilt ?? 0) / 2.5);
  const vibScore = Math.min(1, (reading?.vibration ?? 0) / 50);
  const crackScore = reading?.crack === 1 ? 1 : 0;
  const displacementScore = Math.min(1, (reading?.displacement ?? 0) / 5);
  const anomalyScore = (tiltScore * 0.3 + vibScore * 0.25 + crackScore * 0.3 + displacementScore * 0.15);

  const gaugeRotation = anomalyScore * 180;
  const factors = [
    { label: "Displacement", value: Math.round(displacementScore * 100), color: "bg-teal-400" },
    { label: "Crack", value: Math.round(crackScore * 100), color: "bg-rose-400" },
    { label: "Trend", value: Math.round(tiltScore * 100), color: "bg-cyan-400" },
  ];

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">AI Deformation Analysis</h3>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative w-44 h-24 overflow-hidden">
          <svg viewBox="0 0 200 110" className="w-full h-full">
            <defs>
              <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            {/* Track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#1e293b"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Filled arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${(anomalyScore * 251.2).toFixed(1)} 251.2`}
              className="transition-all duration-700 ease-out"
            />
            {/* Needle */}
            <g
              style={{ transform: `rotate(${gaugeRotation - 90}deg)`, transformOrigin: "100px 100px", transition: "transform 0.7s ease-out" }}
            >
              <line x1="100" y1="100" x2="100" y2="35" stroke={config.hex} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="100" cy="100" r="5" fill={config.hex} />
            </g>
          </svg>
        </div>
        <div className="text-center -mt-2">
          <div className="text-3xl font-bold text-white tabular-nums tracking-tight">
            {anomalyScore.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Anomaly Score</div>
        </div>
        <div className={`mt-3 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider ${config.bg} ${config.border} ${config.text} border`}>
          {config.label}
        </div>
      </div>

      <div className="space-y-3">
        {factors.map((f) => (
          <div key={f.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{f.label}</span>
              <span className="text-xs text-slate-300 font-mono tabular-nums">{f.value}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/60 overflow-hidden">
              <div
                className={`h-full ${f.color} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${f.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
