import { useState, useCallback } from "react";
import { Sidebar, type ViewId } from "./components/Sidebar";
import { Header } from "./components/Header";
import { SensorCards } from "./components/SensorCards";
import { AIAnalysis } from "./components/AIAnalysis";
import { SensorFusion } from "./components/SensorFusion";
import { EarlyWarning } from "./components/EarlyWarning";
import { NodeMap } from "./components/NodeMap";
import { TrendChart } from "./components/TrendChart";
import { ToastContainer, useToastAlerts, type ToastAlert } from "./components/ToastContainer";
import { useMineGuard } from "./lib/useMineGuard";
import { STATUS_CONFIG, type SensorReading } from "./lib/types";
import type { ThresholdBreach } from "./lib/thresholds";
import { playAlertSound } from "./lib/alertSound";
import {
  Activity,
  Radio,
  Brain,
  AlertTriangle,
  TrendingUp,
  Database,
  HeartPulse,
  Settings,
  Map as MapIcon,
} from "lucide-react";

function Footer() {
  return (
    <footer className="shrink-0 border-t border-slate-800/60 bg-slate-950/60 px-6 py-3">
      <p className="text-[11px] text-slate-600 text-center leading-relaxed">
        MineGuard is a research/educational prototype and decision-support system.
        Prototype thresholds and AI predictions are not certified mine-safety limits.
      </p>
    </footer>
  );
}

function ViewHeader({ icon: Icon, title, subtitle }: { icon: typeof Activity; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-cyan-400" />
      </div>
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function PlaceholderView({ icon: Icon, title, subtitle }: { icon: typeof Activity; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-300 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}

function App() {
  const [view, setView] = useState<ViewId>("dashboard");
  const { toasts, addToast, dismissToast } = useToastAlerts();

  const handleAlert = useCallback(
    (reading: SensorReading, breaches: ThresholdBreach[]) => {
      const severity = reading.status === "critical" ? "critical" : "warning";
      const toast: ToastAlert = {
        id: crypto.randomUUID(),
        nodeId: reading.nodeId,
        severity,
        breaches,
        timestamp: reading.timestamp,
      };
      addToast(toast);
      playAlertSound(severity);
    },
    [addToast]
  );

  const { reading, nodes, alerts, history, connection } = useMineGuard(handleAlert);

  const status = reading?.status ?? "normal";
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <Sidebar active={view} onSelect={setView} />
      <div className="flex flex-col flex-1 min-w-0">
        <Header connection={connection} alertCount={alerts.length} />

        <main className="flex-1 overflow-y-auto px-6 py-5">
          {view === "dashboard" && (
            <div className="space-y-5">
              <ViewHeader icon={Activity} title="Dashboard Overview" subtitle="Real-time mine subsidence monitoring at a glance" />
              <SensorCards reading={reading} />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-1">
                  <AIAnalysis reading={reading} />
                </div>
                <div className="lg:col-span-1">
                  <SensorFusion reading={reading} />
                </div>
                <div className="lg:col-span-1">
                  <EarlyWarning alerts={alerts} />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <TrendChart history={history} />
                <NodeMap nodes={nodes} />
              </div>
            </div>
          )}

          {view === "live" && (
            <div className="space-y-5">
              <ViewHeader icon={Activity} title="Live Monitoring" subtitle="Real-time sensor stream from active mine nodes" />
              <SensorCards reading={reading} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AIAnalysis reading={reading} />
                <SensorFusion reading={reading} />
              </div>
              <TrendChart history={history} />
            </div>
          )}

          {view === "map" && (
            <div className="space-y-5">
              <ViewHeader icon={MapIcon} title="Mine Map" subtitle="Geographic view of all sensor node locations" />
              <NodeMap nodes={nodes} />
            </div>
          )}

          {view === "nodes" && (
            <div className="space-y-5">
              <ViewHeader icon={Radio} title="Sensor Nodes" subtitle="Status and configuration of all deployed sensor nodes" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nodes.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500 text-sm">No nodes deployed yet.</div>
                ) : (
                  nodes.map((node) => {
                    const nStatus = (node.status || "normal") as typeof status;
                    const nConfig = STATUS_CONFIG[nStatus];
                    const last = node.lastReading;
                    return (
                      <div key={node.id} className={`rounded-xl border ${nConfig.border} ${nConfig.bg} p-4`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${nConfig.bg} border ${nConfig.border} flex items-center justify-center`}>
                              <Radio className={`w-4 h-4 ${nConfig.text}`} />
                            </div>
                            <span className="text-sm font-bold text-white">Node {node.nodeId}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${nConfig.text} border ${nConfig.border}`}>
                            {nConfig.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between p-2 rounded bg-slate-800/30">
                            <span className="text-slate-500">Tilt</span>
                            <span className="text-slate-300 font-mono">{last?.tilt?.toFixed(2) ?? "0.00"}°</span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-slate-800/30">
                            <span className="text-slate-500">Vibration</span>
                            <span className="text-slate-300 font-mono">{last?.vibration?.toFixed(1) ?? "0.0"} Hz</span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-slate-800/30">
                            <span className="text-slate-500">Disp.</span>
                            <span className="text-slate-300 font-mono">{last?.displacement?.toFixed(2) ?? "0.00"} mm</span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-slate-800/30">
                            <span className="text-slate-500">Crack</span>
                            <span className="text-slate-300 font-mono">{last?.crack === 1 ? "Yes" : "No"}</span>
                          </div>
                        </div>
                        <div className="mt-3 text-[10px] text-slate-600">
                          {node.latitude?.toFixed(4)}, {node.longitude?.toFixed(4)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {view === "ai" && (
            <div className="space-y-5">
              <ViewHeader icon={Brain} title="AI Analysis" subtitle="Deep dive into deformation analysis and sensor fusion" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AIAnalysis reading={reading} />
                <SensorFusion reading={reading} />
              </div>
              <TrendChart history={history} />
            </div>
          )}

          {view === "alerts" && (
            <div className="space-y-5">
              <ViewHeader icon={AlertTriangle} title="Risk & Alerts" subtitle="Early warning center — active and recent alerts" />
              <EarlyWarning alerts={alerts} />
            </div>
          )}

          {view === "trends" && (
            <div className="space-y-5">
              <ViewHeader icon={TrendingUp} title="Trends" subtitle="Historical sensor data visualization and pattern analysis" />
              <TrendChart history={history} />
            </div>
          )}

          {view === "history" && (
            <div className="space-y-5">
              <ViewHeader icon={Database} title="Historical Data" subtitle="Complete sensor reading log" />
              <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/60 text-xs text-slate-500 uppercase tracking-wider">
                      <th className="text-left px-4 py-3 font-medium">Node</th>
                      <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                      <th className="text-right px-4 py-3 font-medium">Tilt</th>
                      <th className="text-right px-4 py-3 font-medium">Vibration</th>
                      <th className="text-right px-4 py-3 font-medium">Disp.</th>
                      <th className="text-center px-4 py-3 font-medium">Crack</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                      <th className="text-right px-4 py-3 font-medium">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-slate-500">No readings recorded yet.</td>
                      </tr>
                    ) : (
                      history.slice(0, 50).map((r) => {
                        const rConfig = STATUS_CONFIG[(r.status || "normal") as typeof status];
                        return (
                          <tr key={r.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-2.5 text-slate-300 font-medium">{r.node_id}</td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(r.timestamp).toLocaleString("en-US", { hour12: false })}</td>
                            <td className="px-4 py-2.5 text-right text-slate-300 font-mono">{r.tilt.toFixed(2)}°</td>
                            <td className="px-4 py-2.5 text-right text-slate-300 font-mono">{r.vibration.toFixed(1)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-300 font-mono">{r.displacement.toFixed(2)}</td>
                            <td className="px-4 py-2.5 text-center">{r.crack === 1 ? <span className="text-red-400 font-bold">Yes</span> : <span className="text-slate-600">No</span>}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${rConfig.text} border ${rConfig.border}`}>{rConfig.label}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-300 font-mono">{r.score}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === "health" && (
            <div className="space-y-5">
              <ViewHeader icon={HeartPulse} title="System Health" subtitle="Backend, database, and sensor connectivity status" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">API Endpoint</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${connection === "live" ? "bg-emerald-400" : connection === "mock" ? "bg-amber-400" : "bg-slate-500"} animate-pulse`} />
                  </div>
                  <div className={`text-2xl font-bold ${connection === "live" ? "text-emerald-400" : connection === "mock" ? "text-amber-400" : "text-slate-500"}`}>
                    {connection === "live" ? "Online" : connection === "mock" ? "Demo Mode" : "Connecting"}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Express server status</div>
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">Database</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">Connected</div>
                  <div className="text-xs text-slate-600 mt-1">MongoDB via Mongoose</div>
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">Realtime</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${connection === "live" ? "bg-emerald-400" : connection === "mock" ? "bg-amber-400" : "bg-slate-500"} animate-pulse`} />
                  </div>
                  <div className={`text-2xl font-bold ${connection === "live" ? "text-emerald-400" : connection === "mock" ? "text-amber-400" : "text-slate-500"}`}>
                    {connection === "live" ? "Active" : connection === "mock" ? "Simulated" : "Pending"}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Socket.io connection</div>
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">Active Nodes</span>
                    <Radio className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{nodes.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Sensor nodes online</div>
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">Total Readings</span>
                    <Database className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-white">{history.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Records in buffer</div>
                </div>
                <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">Active Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className={`text-2xl font-bold ${alerts.length > 0 ? "text-amber-400" : "text-emerald-400"}`}>{alerts.length}</div>
                  <div className="text-xs text-slate-600 mt-1">Warnings + critical</div>
                </div>
              </div>
            </div>
          )}

          {view === "settings" && (
            <div className="space-y-5">
              <ViewHeader icon={Settings} title="Settings" subtitle="System configuration and preferences" />
              <PlaceholderView icon={Settings} title="Settings Panel" subtitle="Configuration options will be available in a future release." />
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
