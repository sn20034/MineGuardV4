import { TrendingUp } from "lucide-react";
import type { ReadingRecord } from "../lib/types";

interface TrendChartProps {
  history: ReadingRecord[];
}

export function TrendChart({ history }: TrendChartProps) {
  const data = [...history].reverse().slice(-50);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Sensor Trends</h3>
        </div>
        <div className="flex items-center justify-center py-12 text-sm text-slate-500">
          Waiting for sensor data...
        </div>
      </div>
    );
  }

  const w = 600;
  const h = 200;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const series = [
    { key: "tilt", label: "Tilt (°)", color: "#22d3ee", max: 2.5 },
    { key: "vibration", label: "Vibration (Hz)", color: "#3b82f6", max: 50 },
    { key: "displacement", label: "Displacement (mm)", color: "#2dd4bf", max: 5 },
  ] as const;

  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Sensor Trends</h3>
        </div>
        <div className="flex items-center gap-3">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[10px] text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: "200px" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line
              x1={padding.left}
              y1={padding.top + chartH * t}
              x2={w - padding.right}
              y2={padding.top + chartH * t}
              stroke="#1e293b"
              strokeWidth="1"
            />
            <text x={padding.left - 8} y={padding.top + chartH * (1 - t) + 4} fill="#475569" fontSize="9" textAnchor="end">
              {Math.round(t * 100)}
            </text>
          </g>
        ))}

        {/* Lines */}
        {series.map((s) => {
          const points = data.map((r, i) => {
            const val = r[s.key] as number;
            const x = padding.left + i * xStep;
            const y = padding.top + chartH * (1 - Math.min(1, val / s.max));
            return `${x},${y}`;
          });
          return (
            <g key={s.key}>
              <polyline
                points={points.join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              {data.map((r, i) => {
                const val = r[s.key] as number;
                const x = padding.left + i * xStep;
                const y = padding.top + chartH * (1 - Math.min(1, val / s.max));
                return <circle key={i} cx={x} cy={y} r="1.5" fill={s.color} opacity="0.7" />;
              })}
            </g>
          );
        })}

        {/* X axis labels */}
        {data.length > 0 && (
          <text x={padding.left} y={h - 8} fill="#475569" fontSize="9">
            {new Date(data[0].timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </text>
        )}
        {data.length > 1 && (
          <text x={w - padding.right} y={h - 8} fill="#475569" fontSize="9" textAnchor="end">
            {new Date(data[data.length - 1].timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </text>
        )}
      </svg>
    </div>
  );
}
