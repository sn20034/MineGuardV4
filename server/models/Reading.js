import mongoose from "mongoose";

const readingSchema = new mongoose.Schema({
  nodeId: {
    type: String,
    required: true,
  },
  tilt: {
    type: Number,
    default: 0,
  },
  vibration: {
    type: Number,
    default: 0,
  },
  displacement: {
    type: Number,
    default: 0,
  },
  crack: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["normal", "watch", "warning", "critical"],
    default: "normal",
  },
  score: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries by node + time
readingSchema.index({ nodeId: 1, timestamp: -1 });
readingSchema.index({ status: 1, timestamp: -1 });

export default mongoose.model("Reading", readingSchema);
