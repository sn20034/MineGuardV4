import { useEffect, useState, useCallback } from "react";
import { X, AlertTriangle, AlertOctagon } from "lucide-react";
import type { ThresholdBreach } from "../lib/thresholds";

export interface ToastAlert {
  id: string;
  nodeId: string;
  severity: "warning" | "critical";
  breaches: ThresholdBreach[];
  timestamp: string;
}

interface ToastContainerProps {
  toasts: ToastAlert[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastAlert; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => onDismiss(toast.id), 8000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const isCritical = toast.severity === "critical";
  const Icon = isCritical ? AlertOctagon : AlertTriangle;

  return (
    <div
      className={`pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${
        isCritical
          ? "bg-red-950/90 border-red-500/50 shadow-red-500/20"
          : "bg-amber-950/90 border-amber-500/50 shadow-amber-500/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
            isCritical ? "bg-red-500/20" : "bg-amber-500/20"
          }`}
        >
          <Icon className={`w-5 h-5 ${isCritical ? "text-red-400" : "text-amber-400"} ${isCritical ? "animate-pulse" : ""}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded ${
                isCritical
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}
            >
              {isCritical ? "CRITICAL" : "WARNING"}
            </span>
            <span className="text-xs text-slate-400">Node {toast.nodeId}</span>
          </div>
          <p className="text-sm text-white font-semibold mb-1.5">
            {isCritical ? "Critical threshold exceeded" : "Threshold breach detected"}
          </p>
          <div className="space-y-0.5">
            {toast.breaches.map((b) => (
              <div key={b.field} className="text-xs text-slate-300 flex items-center gap-1.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${isCritical ? "bg-red-400" : "bg-amber-400"}`} />
                <span className="text-slate-400">{b.label}:</span>
                <span className="font-mono font-bold text-white">
                  {b.value.toFixed(b.field === "crack" ? 0 : 2)}{b.unit}
                </span>
                <span className="text-slate-500">(limit: {b.threshold}{b.unit})</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function useToastAlerts() {
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  const addToast = useCallback((toast: ToastAlert) => {
    setToasts((prev) => [toast, ...prev].slice(0, 5));
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
