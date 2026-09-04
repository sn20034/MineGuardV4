import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "socket.io";
import apiRoutes from "./routes/api.js";

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mineguard";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const app = express();
const server = http.createServer(app);

// --- Middleware ---
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  }),
);
app.use(express.json());

// --- Socket.io ---
const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Make io accessible from route handlers
app.set("io", io);

app.get("/", (_req, res) => {
  res.json({
    name: "MineGuard Control Center API",
    status: "online",
    health: "/api/health",
  });
});

// --- Routes ---
app.use("/api", apiRoutes);

// --- MongoDB connection + start server ---
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`MineGuard server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
