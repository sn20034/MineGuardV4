import { Router } from "express";
import Node from "../models/Node.js";
import Reading from "../models/Reading.js";
import { classifyRisk } from "../utils/classifyRisk.js";

const router = Router();

/*
 * MineGuard demo sensor locations
 * --------------------------------
 * Singrauli coal-mining region, Madhya Pradesh.
 *
 * These are illustrative coordinates for the hackathon
 * prototype and are NOT exact locations of mine infrastructure.
 */
const DEMO_NODE_LOCATIONS = {
  N01: {
    latitude: 24.1905,
    longitude: 82.6765,
  },

  N02: {
    latitude: 24.2115,
    longitude: 82.6515,
  },

  N03: {
    latitude: 24.1695,
    longitude: 82.7045,
  },

  N04: {
    latitude: 24.2255,
    longitude: 82.704,
  },

  N05: {
    latitude: 24.1535,
    longitude: 82.6545,
  },
};

/*
 * Default location for unknown/demo nodes.
 */
const DEFAULT_NODE_LOCATION = {
  latitude: 24.1905,
  longitude: 82.6765,
};

/*
 * Get coordinates for a node.
 */
function getNodeLocation(nodeId) {
  return DEMO_NODE_LOCATIONS[nodeId] ?? DEFAULT_NODE_LOCATION;
}

/* ==========================================
   HEALTH
========================================== */

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

/* ==========================================
   GET ALL SENSOR NODES
========================================== */

router.get("/nodes", async (_req, res) => {
  try {
    const nodes = await Node.find().sort({
      nodeId: 1,
    });

    res.json(nodes);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ==========================================
   POST SENSOR READING
========================================== */

router.post("/reading", async (req, res) => {
  try {
    const { nodeId, tilt, vibration, crack, displacement } = req.body;

    /* -------------------------------
       Validate required fields
    -------------------------------- */

    if (
      !nodeId ||
      tilt === undefined ||
      vibration === undefined ||
      crack === undefined
    ) {
      return res.status(400).json({
        error: "Missing required fields: nodeId, tilt, vibration, crack",
      });
    }

    if (crack !== 0 && crack !== 1) {
      return res.status(400).json({
        error: "crack must be either 0 or 1",
      });
    }

    /* -------------------------------
       Normalize displacement
    -------------------------------- */

    const disp = displacement ?? 0;

    /* -------------------------------
       Calculate risk on server
    -------------------------------- */

    const { score, status } = classifyRisk(
      Number(tilt),
      Number(vibration),
      Number(disp),
      Number(crack),
    );

    /* -------------------------------
       Save reading
    -------------------------------- */

    const reading = await Reading.create({
      nodeId,
      tilt: Number(tilt),
      vibration: Number(vibration),
      displacement: Number(disp),
      crack: Number(crack),
      status,
      score,
    });

    /* -------------------------------
       Node location
    -------------------------------- */

    const location = getNodeLocation(nodeId);

    const lastReading = {
      tilt: Number(tilt),
      vibration: Number(vibration),
      displacement: Number(disp),
      crack: Number(crack),
      status,
      timestamp: reading.timestamp,
    };

    /* -------------------------------
       Update or create node
    -------------------------------- */

    const existingNode = await Node.findOne({
      nodeId,
    });

    if (existingNode) {
      existingNode.status = status;
      existingNode.lastReading = lastReading;

      /*
       * Keep demo coordinates if they already exist.
       * If coordinates are missing/invalid, restore them.
       */
      if (!existingNode.latitude || !existingNode.longitude) {
        existingNode.latitude = location.latitude;
        existingNode.longitude = location.longitude;
      }

      await existingNode.save();
    } else {
      await Node.create({
        nodeId,
        latitude: location.latitude,
        longitude: location.longitude,
        status,
        lastReading,
      });
    }

    /* -------------------------------
       Send real-time Socket.io update
    -------------------------------- */

    const io = req.app.get("io");

    if (io) {
      io.emit("sensorData", {
        nodeId,
        tilt: Number(tilt),
        vibration: Number(vibration),
        displacement: Number(disp),
        crack: Number(crack),
        status,
        score,
        timestamp: reading.timestamp,
      });
    }

    res.status(200).json(reading);
  } catch (err) {
    console.error("Reading error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

/* ==========================================
   GET NODE HISTORY
========================================== */

router.get("/readings/:nodeId", async (req, res) => {
  try {
    const { nodeId } = req.params;

    const requestedLimit = Number(req.query.limit ?? 50);

    const limit = Math.min(Math.max(requestedLimit, 1), 100);

    const readings = await Reading.find({
      nodeId,
    })
      .sort({
        timestamp: -1,
      })
      .limit(limit);

    res.json(readings);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

/* ==========================================
   GET RECENT ALERTS
========================================== */

router.get("/alerts", async (_req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const alerts = await Reading.find({
      status: {
        $in: ["warning", "critical"],
      },

      timestamp: {
        $gte: twentyFourHoursAgo,
      },
    })
      .sort({
        timestamp: -1,
      })
      .limit(50);

    res.json(alerts);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
