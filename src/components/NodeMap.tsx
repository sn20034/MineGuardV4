import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  Polygon,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Radio, ShieldCheck } from "lucide-react";
import type { SensorStatus } from "../lib/types";
import { STATUS_CONFIG } from "../lib/types";
import { useEffect } from "react";

interface MapNode {
  id: string;
  nodeId: string;
  latitude: number;
  longitude: number;
  status: SensorStatus;
  lastReading: {
    tilt: number;
    vibration: number;
    displacement: number;
    crack: number;
    status: string;
    timestamp: string;
  } | null;
}

interface NodeMapProps {
  nodes: MapNode[];
}

/*
 * Automatically adjusts the map view whenever
 * the sensor nodes change.
 */
function MapAutoFit({ nodes }: { nodes: MapNode[] }) {
  const map = useMap();

  useEffect(() => {
    if (nodes.length === 0) {
      map.setView([23.0, 82.0], 11);
      return;
    }

    if (nodes.length === 1) {
      map.setView([nodes[0].latitude, nodes[0].longitude], 12);
      return;
    }

    const bounds = nodes.map(
      (node) => [node.latitude, node.longitude] as [number, number],
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 13,
    });
  }, [map, nodes]);

  return null;
}

/*
 * Creates a rectangular monitoring zone around
 * the center of the sensor network.
 */
function createMineZone(
  latitude: number,
  longitude: number,
): [number, number][] {
  const latOffset = 0.035;
  const lngOffset = 0.045;

  return [
    [latitude + latOffset, longitude - lngOffset],
    [latitude + latOffset, longitude + lngOffset],
    [latitude - latOffset, longitude + lngOffset],
    [latitude - latOffset, longitude - lngOffset],
  ];
}

export function NodeMap({ nodes }: NodeMapProps) {
  const center: [number, number] =
    nodes.length > 0 ? [nodes[0].latitude, nodes[0].longitude] : [23.0, 82.0];

  /*
   * Use the first sensor as the center of the
   * demonstration mining zone.
   */
  const mineZone = createMineZone(center[0], center[1]);

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-5">
      {/* ================================
          HEADER
      ================================= */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />

          <h3 className="text-sm font-semibold text-white">Node Location</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[10px] uppercase tracking-wider text-slate-500">
            Regional View
          </span>
        </div>
      </div>

      {/* ================================
          MAP
      ================================= */}
      <div
        className="relative rounded-lg overflow-hidden border border-slate-800/60"
        style={{ height: "380px" }}
      >
        <MapContainer
          center={center}
          zoom={12}
          scrollWheelZoom={true}
          style={{
            height: "100%",
            width: "100%",
            background: "#0f172a",
          }}
          className="z-0"
        >
          {/* Automatically fit all nodes */}
          <MapAutoFit nodes={nodes} />

          {/* ================================
              OPENSTREETMAP BASEMAP
          ================================= */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            maxZoom={19}
          />

          {/* ================================
              MINE MONITORING ZONE
          ================================= */}
          <Polygon
            positions={mineZone}
            pathOptions={{
              color: "#22d3ee",
              fillColor: "#0891b2",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "8 6",
            }}
          >
            <Tooltip direction="center" permanent={false} sticky>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                }}
              >
                Mine Monitoring Zone
              </div>
            </Tooltip>
          </Polygon>

          {/* ================================
              SENSOR NETWORK CONNECTION
          ================================= */}
          {nodes.length > 1 && (
            <Polyline
              positions={nodes.map(
                (node) => [node.latitude, node.longitude] as [number, number],
              )}
              pathOptions={{
                color: "#38bdf8",
                dashArray: "7 7",
                weight: 2,
                opacity: 0.7,
              }}
            />
          )}

          {/* ================================
              SENSOR NODES
          ================================= */}
          {nodes.map((node) => {
            const status = (node.status || "normal") as SensorStatus;

            const config = STATUS_CONFIG[status];
            const last = node.lastReading;

            return (
              <CircleMarker
                key={node.id}
                center={[node.latitude, node.longitude]}
                radius={15}
                pathOptions={{
                  color: config.hex,
                  fillColor: config.hex,
                  fillOpacity: 0.45,
                  weight: 3,
                }}
              >
                {/* Small node label */}
                <Tooltip direction="top" offset={[0, -12]}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    {node.nodeId}
                  </div>
                </Tooltip>

                {/* ================================
                    NODE POPUP
                ================================= */}
                <Popup>
                  <div
                    style={{
                      minWidth: "205px",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {/* Node title */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          backgroundColor: config.hex,
                        }}
                      />

                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: "15px",
                        }}
                      >
                        Node {node.nodeId}
                      </div>
                    </div>

                    {/* Status */}
                    <div
                      style={{
                        padding: "6px 8px",
                        marginBottom: "8px",
                        borderRadius: "5px",
                        background: "#f3f4f6",
                        fontSize: "12px",
                      }}
                    >
                      Status:{" "}
                      <strong
                        style={{
                          color: config.hex,
                        }}
                      >
                        {config.label}
                      </strong>
                    </div>

                    {/* Sensor readings */}
                    {last && (
                      <div
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.8",
                          color: "#374151",
                        }}
                      >
                        <div>
                          Tilt:{" "}
                          <strong>{Number(last.tilt ?? 0).toFixed(2)}°</strong>
                        </div>

                        <div>
                          Vibration:{" "}
                          <strong>
                            {Number(last.vibration ?? 0).toFixed(1)}
                            Hz
                          </strong>
                        </div>

                        <div>
                          Displacement:{" "}
                          <strong>
                            {Number(last.displacement ?? 0).toFixed(2)}
                            mm
                          </strong>
                        </div>

                        <div>
                          Crack:{" "}
                          <strong
                            style={{
                              color: last.crack === 1 ? "#ef4444" : "#16a34a",
                            }}
                          >
                            {last.crack === 1 ? "Detected" : "None"}
                          </strong>
                        </div>
                      </div>
                    )}

                    {/* Coordinates */}
                    <div
                      style={{
                        borderTop: "1px solid #e5e7eb",
                        marginTop: "8px",
                        paddingTop: "7px",
                        fontSize: "10px",
                        color: "#6b7280",
                      }}
                    >
                      GPS: {node.latitude.toFixed(5)},{" "}
                      {node.longitude.toFixed(5)}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* ================================
            MAP OVERLAY - TOP LEFT
        ================================= */}
        <div className="absolute top-3 left-3 z-[1000]">
          <div className="rounded-lg border border-slate-700/70 bg-slate-950/85 backdrop-blur-sm px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />

              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-white">
                  MineGuard Zone
                </div>

                <div className="text-[9px] text-slate-500">
                  Geospatial Monitoring
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================
            MAP OVERLAY - TOP RIGHT
        ================================= */}
        <div className="absolute top-3 right-3 z-[1000]">
          <div className="rounded-lg border border-slate-700/70 bg-slate-950/85 backdrop-blur-sm px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />

              <span className="text-[10px] text-slate-300">
                {nodes.length} Sensor {nodes.length === 1 ? "Node" : "Nodes"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================================
          STATUS LEGEND
      ================================= */}
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {(["normal", "watch", "warning", "critical"] as SensorStatus[]).map(
          (status) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: STATUS_CONFIG[status].hex,
                }}
              />

              <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                {STATUS_CONFIG[status].label}
              </span>
            </div>
          ),
        )}
      </div>

      {/* ================================
          NODE COUNT / ZONE INFO
      ================================= */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
        <div className="text-[10px] text-slate-600 uppercase tracking-wider">
          Monitoring Area
        </div>

        <div className="text-[10px] text-cyan-500/70 uppercase tracking-wider">
          {nodes.length > 0 ? "Network Active" : "Awaiting Nodes"}
        </div>
      </div>
    </div>
  );
}
