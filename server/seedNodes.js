import "dotenv/config";
import mongoose from "mongoose";
import Node from "./models/Node.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mineguard";

/*
 * MineGuard demo sensor network
 *
 * Singrauli coal-mining region, Madhya Pradesh.
 *
 * Coordinates are illustrative demo locations
 * for the hackathon prototype.
 */

const DEMO_NODES = [
  {
    nodeId: "N01",
    latitude: 24.1905,
    longitude: 82.6765,
  },

  {
    nodeId: "N02",
    latitude: 24.2115,
    longitude: 82.6515,
  },

  {
    nodeId: "N03",
    latitude: 24.1695,
    longitude: 82.7045,
  },

  {
    nodeId: "N04",
    latitude: 24.2255,
    longitude: 82.704,
  },

  {
    nodeId: "N05",
    latitude: 24.1535,
    longitude: 82.6545,
  },
];

async function seedNodes() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(MONGODB_URI);

    console.log("MongoDB connected.");

    for (const demoNode of DEMO_NODES) {
      const node = await Node.findOneAndUpdate(
        {
          nodeId: demoNode.nodeId,
        },
        {
          $set: {
            latitude: demoNode.latitude,
            longitude: demoNode.longitude,
          },

          $setOnInsert: {
            status: "normal",

            lastReading: {
              tilt: 0,
              vibration: 0,
              displacement: 0,
              crack: 0,
              status: "normal",
              timestamp: new Date(),
            },
          },
        },
        {
          new: true,
          upsert: true,
        },
      );

      console.log(`${node.nodeId} -> ${node.latitude}, ${node.longitude}`);
    }

    console.log("");
    console.log("MineGuard demo sensor network seeded successfully.");
    console.log("Region: Singrauli, Madhya Pradesh");
    console.log("Nodes: N01, N02, N03, N04, N05");
  } catch (error) {
    console.error("Failed to seed nodes:", error.message);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedNodes();
