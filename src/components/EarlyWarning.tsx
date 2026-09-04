import { AlertTriangle, MapPin, Eye, Check } from "lucide-react";
import type { AlertRecord, SensorStatus } from "../lib/types";
import { STATUS_CONFIG } from "../lib/types";

interface EarlyWarningProps {
  alerts: AlertRecord[];
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getAlertTitle(status: SensorStatus, score: number): string {
  if (status === "critical") {
    if (score >= 90) return "Imminent Subsidence Risk Detected";
    return "Rapid Deformation Pattern Detected";
  }
  if (status === "warning") {
    return "Accelerating Ground Movement";
  }
  return "Anomalous Reading Detected";
}

function getAlertDescription(status: SensorStatus, reading: AlertRecord): string {
  const parts: string[] = [];
  if (reading.tilt > 1.5) parts.push(`Tilt angle ${reading.tilt.toFixed(2)}° exceeds critical threshold`);
  else if (reading.tilt > 0.8) parts.push(`Tilt angle ${reading.tilt.toFixed(2)}° above watch threshold`);
  if (reading.vibration > 30) parts.push(`Vibration ${reading.vibration.toFixed(1)} Hz at critical level`);
  else if (reading.vibration > 10) parts.push(`Vibration ${reading.vibration.toFixed(1)} Hz elevated`);
  if (reading.crack === 1) parts.push("Crack sensor triggered — structural integrity compromised");
  if (parts.length === 0) parts.push("Sensor readings outside normal parameters");
  return parts.join(". ") + ".";
}

function getRecommendation(status: SensorStatus): string {
  if (status === "critical") return "Evacuate personnel immediately. Deploy structural assessment team.";
  if (status === "warning") return "Restrict access to affected zone. Schedule emergency inspection.";
  return "Increase monitoring frequency. Alert on-site supervisor.";
}

export function EarlyWarning({ alerts }: EarlyWarningProps) {
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Early Warning Center</h3>
        </div>
        <span className="text-xs text-slate-500">
          {alerts.length} active {alerts.length === 1 ? "alert" : "alerts"}
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm text-slate-400">All systems nominal</p>
          <p className="text-xs text-slate-600 mt-1">No active warnings or critical alerts</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {alerts.slice(0, 10).map((alert) => {
            const config = STATUS_CONFIG[alert.status];
            const isCritical = alert.status === "critical";
            return (
              <div
                key={alert.id}
                className={`rounded-lg border ${config.border} ${config.bg} p-4 transition-all duration-200 hover:scale-[1.01]`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${config.text} border ${config.border}`}>
                      {config.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />
                      Node {alert.node_id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{timeAgo(alert.timestamp)}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">
                  {getAlertTitle(alert.status, alert.score)}
                </h4>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {getAlertDescription(alert.status, alert)}
                </p>

                <div className="flex items-center gap-4 mb-3 text-xs">
                  <span className="text-slate-500">
                    Affected: <span className="text-slate-300 font-medium">{alert.node_id}</span>
                  </span>
                  <span className="text-slate-500">
                    Risk: <span className={`${config.text} font-bold`}>{alert.score}%</span>
                  </span>
                </div>

                <div className={`flex items-start gap-2 mb-3 px-3 py-2 rounded-md ${isCritical ? "bg-red-500/5" : "bg-amber-500/5"}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text} mt-0.5`}>Action:</span>
                  <span className="text-xs text-slate-400">{getRecommendation(alert.status)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${config.text} border ${config.border} ${config.bg} hover:opacity-80 transition-opacity`}>
                    <Eye className="w-3.5 h-3.5" />
                    View Zone
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                    Acknowledge
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
