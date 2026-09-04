import mongoose from "mongoose";

const nodeSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
    unique: true,
  },
  latitude: {
    type: Number,
    default: 23.0,
  },
  longitude: {
    type: Number,
    default: 82.0,
  },
  status: {
    type: String,
    enum: ["normal", "watch", "warning", "critical"],
    default: "normal",
  },
  lastReading: {
    tilt: { type: Number, default: 0 },
    vibration: { type: Number, default: 0 },
    displacement: { type: Number, default: 0 },
    crack: { type: Number, default: 0 },
    status: { type: String, default: "normal" },
    timestamp: { type: Date, default: Date.now },
  },
});

export default mongoose.model("Node", nodeSchema);
