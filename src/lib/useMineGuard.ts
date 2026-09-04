import { useEffect, useRef, useState, useCallback } from "react";
import { socket, API_BASE } from "./api";
import {
  classifyRisk,
  type SensorReading,
  type SensorStatus,
  type ReadingRecord,
  type AlertRecord,
} from "./types";
import {
  checkThresholds,
  DEFAULT_THRESHOLDS,
  type ThresholdBreach,
} from "./thresholds";

export type ConnectionState = "connecting" | "live" | "mock";

interface LiveState {
  reading: SensorReading | null;
  nodes: NodeInfo[];
  alerts: AlertRecord[];
  history: ReadingRecord[];
  connection: ConnectionState;
}

interface NodeInfo {
  id: string;
  nodeId: string;
  latitude: number;
  longitude: number;
  status: SensorStatus;
  lastReading: SensorReading | null;
}

interface SocketSensorData extends SensorReading {
  score: number;
}

export function useMineGuard(
  onAlert?: (reading: SensorReading, breaches: ThresholdBreach[]) => void,
) {
  const [state, setState] = useState<LiveState>({
    reading: null,
    nodes: [],
    alerts: [],
    history: [],
    connection: "connecting",
  });

  const mockRef = useRef(false);
  const mockCleanupRef = useRef<(() => void) | null>(null);

  const fetchInitial = useCallback(async () => {
    try {
      const [nodesRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/nodes`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${API_BASE}/alerts`).then((r) => (r.ok ? r.json() : [])),
      ]);

      const mappedNodes: NodeInfo[] = (nodesRes || []).map(
        (n: Record<string, unknown>) => {
          const lr = n.lastReading as Record<string, unknown> | undefined;

          return {
            id: String(n._id ?? n.id ?? n.nodeId),
            nodeId: String(n.nodeId ?? ""),
            latitude: Number(n.latitude ?? 23),
            longitude: Number(n.longitude ?? 82),
            status: (n.status ?? "normal") as SensorStatus,

            lastReading: lr
              ? {
                  nodeId: String(n.nodeId ?? ""),
                  tilt: Number(lr.tilt ?? 0),
                  vibration: Number(lr.vibration ?? 0),
                  displacement: Number(lr.displacement ?? 0),
                  crack: Number(lr.crack ?? 0),
                  status: (lr.status ?? "normal") as SensorStatus,
                  timestamp:
                    typeof lr.timestamp === "string"
                      ? lr.timestamp
                      : new Date().toISOString(),
                }
              : null,
          };
        },
      );

      let history: ReadingRecord[] = [];

      if (mappedNodes.length > 0) {
        const histRes = await fetch(
          `${API_BASE}/readings/${mappedNodes[0].nodeId}?limit=50`,
        );

        if (histRes.ok) {
          const histData = await histRes.json();

          history = (histData || []).map((r: Record<string, unknown>) => ({
            id: String(r._id ?? r.id),
            node_id: String(r.nodeId ?? ""),
            tilt: Number(r.tilt ?? 0),
            vibration: Number(r.vibration ?? 0),
            displacement: Number(r.displacement ?? 0),
            crack: Number(r.crack ?? 0),
            status: (r.status ?? "normal") as SensorStatus,
            score: Number(r.score ?? 0),
            timestamp: String(r.timestamp ?? new Date().toISOString()),
          }));
        }
      }

      const lastReading = mappedNodes[0]?.lastReading ?? null;

      const mappedAlerts: AlertRecord[] = (alertsRes || []).map(
        (a: Record<string, unknown>) => ({
          id: String(a._id ?? a.id),
          node_id: String(a.nodeId ?? ""),
          tilt: Number(a.tilt ?? 0),
          vibration: Number(a.vibration ?? 0),
          displacement: Number(a.displacement ?? 0),
          crack: Number(a.crack ?? 0),
          status: (a.status ?? "normal") as SensorStatus,
          score: Number(a.score ?? 0),
          timestamp: String(a.timestamp ?? new Date().toISOString()),
        }),
      );

      setState((prev) => ({
        ...prev,
        nodes: mappedNodes,
        alerts: mappedAlerts,
        history,
        reading: lastReading,
      }));
    } catch (error) {
      console.warn(
        "MineGuard initial API fetch failed. Waiting for mock fallback.",
        error,
      );
    }
  }, []);

  const startMock = useCallback(() => {
    if (mockRef.current) {
      return mockCleanupRef.current ?? undefined;
    }

    mockRef.current = true;

    setState((prev) => ({
      ...prev,
      connection: "mock",
    }));

    let tilt = 0.3;
    let vibration = 5;
    let displacement = 0.5;
    let crack = 0;

    const interval = window.setInterval(() => {
      tilt = Math.max(0, Math.min(2.5, tilt + (Math.random() - 0.45) * 0.3));

      vibration = Math.max(
        0,
        Math.min(50, vibration + (Math.random() - 0.45) * 8),
      );

      displacement = Math.max(
        0,
        Math.min(5, displacement + (Math.random() - 0.45) * 0.4),
      );

      if (Math.random() > 0.85) {
        crack = crack === 0 ? 1 : 0;
      }

      // IMPORTANT:
      // Risk now uses all four sensors.
      const { score, status } = classifyRisk(
        tilt,
        vibration,
        displacement,
        crack,
      );

      const timestamp = new Date().toISOString();

      const reading: SensorReading = {
        nodeId: "N01",
        tilt: Number(tilt.toFixed(2)),
        vibration: Number(vibration.toFixed(1)),
        displacement: Number(displacement.toFixed(2)),
        crack,
        status: status as SensorStatus,
        timestamp,
      };

      setState((prev) => {
        const newHistEntry: ReadingRecord = {
          id: crypto.randomUUID(),
          node_id: reading.nodeId,
          tilt: reading.tilt,
          vibration: reading.vibration,
          displacement: reading.displacement,
          crack: reading.crack,
          status: reading.status,
          score,
          timestamp,
        };

        const newHistory = [newHistEntry, ...prev.history].slice(0, 50);

        const newAlerts =
          reading.status === "warning" || reading.status === "critical"
            ? [newHistEntry as AlertRecord, ...prev.alerts].slice(0, 20)
            : prev.alerts;

        return {
          ...prev,
          reading,
          history: newHistory,
          alerts: newAlerts,
        };
      });

      const breaches = checkThresholds(reading, DEFAULT_THRESHOLDS);

      if (breaches.length > 0 && onAlert) {
        onAlert(reading, breaches);
      }
    }, 2500);

    const cleanup = () => {
      window.clearInterval(interval);
      mockRef.current = false;
      mockCleanupRef.current = null;
    };

    mockCleanupRef.current = cleanup;

    return cleanup;
  }, [onAlert]);

  useEffect(() => {
    let cancelled = false;

    const handleSensorData = (data: SocketSensorData) => {
      if (cancelled) return;

      const reading: SensorReading = {
        nodeId: data.nodeId,
        tilt: data.tilt,
        vibration: data.vibration,
        displacement: data.displacement,
        crack: data.crack,
        status: data.status,
        timestamp: data.timestamp,
      };

      const histEntry: ReadingRecord = {
        id: crypto.randomUUID(),
        node_id: data.nodeId,
        tilt: data.tilt,
        vibration: data.vibration,
        displacement: data.displacement,
        crack: data.crack,
        status: data.status,
        score: data.score,
        timestamp: data.timestamp,
      };

      setState((prev) => {
        const newHistory = [histEntry, ...prev.history].slice(0, 50);

        const newAlerts =
          data.status === "warning" || data.status === "critical"
            ? [histEntry as AlertRecord, ...prev.alerts].slice(0, 20)
            : prev.alerts;

        return {
          ...prev,
          reading,
          connection: "live",
          history: newHistory,
          alerts: newAlerts,
        };
      });

      const breaches = checkThresholds(reading, DEFAULT_THRESHOLDS);

      if (breaches.length > 0 && onAlert) {
        onAlert(reading, breaches);
      }
    };

    const handleConnect = () => {
      if (cancelled) return;

      setState((prev) => ({
        ...prev,
        connection: "live",
      }));

      if (mockCleanupRef.current) {
        mockCleanupRef.current();
      }
    };

    const handleDisconnect = () => {
      if (cancelled) return;

      setState((prev) => ({
        ...prev,
        connection: "connecting",
      }));
    };

    socket.on("sensorData", handleSensorData);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    fetchInitial();

    const fallbackTimer = window.setTimeout(() => {
      if (cancelled) return;

      setState((prev) => {
        if (prev.connection === "connecting" && prev.reading === null) {
          startMock();
        }

        return prev;
      });
    }, 8000);

    return () => {
      cancelled = true;

      window.clearTimeout(fallbackTimer);

      socket.off("sensorData", handleSensorData);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);

      if (mockCleanupRef.current) {
        mockCleanupRef.current();
      }
    };
  }, [fetchInitial, startMock]);

  return state;
}
