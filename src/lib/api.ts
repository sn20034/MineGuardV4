import { io } from "socket.io-client";

// In dev, Vite proxies /socket.io to the backend at localhost:5000.
// In production, set VITE_SOCKET_URL to the backend's public URL.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const socket = io(SOCKET_URL || "/", {
  autoConnect: true,
  transports: ["websocket", "polling"],
});

// In dev, Vite proxies /api to the backend. In production, set VITE_API_BASE.
export const API_BASE = import.meta.env.VITE_API_BASE || "/api";
