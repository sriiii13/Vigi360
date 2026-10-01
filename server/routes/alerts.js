import express from "express";
import mongoose from "mongoose";
import Alert from "../models/Alert.js";
import { isDbConnected } from "../config/db.js";

const router = express.Router();

// In-memory alert cache for zero-delay delivery and DB resilience
const inMemoryAlerts = [];

// Helper to generate unique, collision-resistant Alert ID
const generateAlertId = () => `ALT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

// @route   POST /api/alerts
// @desc    Create a new alert (e.g. from bus-app critical driver event)
router.post("/", async (req, res) => {
  try {
    const { driverId, driverName, vehicleId, type, severity, drowsinessScore, closureDuration, details, status, timestamp } = req.body;

    const alertId = req.body.id || generateAlertId();

    const alertObj = {
      id: alertId,
      driverId: driverId || "DRV-001",
      driverName: driverName || "Arun Kumar",
      vehicleId: vehicleId || "VEH-001",
      type: type || "Severe Drowsiness",
      severity: severity || "CRITICAL",
      drowsinessScore: drowsinessScore ?? 80,
      closureDuration: closureDuration ?? 1.5,
      details: details || `Critical drowsiness event detected (${closureDuration || 1.5}s closure)`,
      status: status || "Unresolved",
      timestamp: timestamp || (new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (Live)"),
      createdAt: new Date().toISOString()
    };

    // Store in memory immediately for fast delivery
    inMemoryAlerts.unshift(alertObj);

    let savedAlert = alertObj;

    // Persist to Mongo if DB is connected
    if (isDbConnected()) {
      try {
        const newAlert = new Alert(alertObj);
        savedAlert = await newAlert.save();
      } catch (dbErr) {
        console.warn("MongoDB save warning (alert kept in memory):", dbErr.message);
      }
    }

    console.log(`[Backend Alert] Created alert ${alertId} (${alertObj.type} - ${alertObj.severity})`);

    return res.status(201).json({
      success: true,
      message: "Critical alert created successfully",
      data: savedAlert
    });
  } catch (error) {
    console.error("Error saving alert:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create alert"
    });
  }
});

// @route   GET /api/alerts
// @desc    Get all alerts (for Fleet Manager Dashboard)
router.get("/", async (req, res) => {
  try {
    let dbAlerts = [];
    if (isDbConnected()) {
      try {
        dbAlerts = await Alert.find().sort({ createdAt: -1 });
      } catch (dbErr) {
        console.warn("MongoDB find warning:", dbErr.message);
      }
    }

    // Merge DB alerts with in-memory alerts, preferring DB records if present
    const seenIds = new Set();
    const merged = [];

    const processAlert = (a) => {
      const key = String(a.id || a._id);
      if (!seenIds.has(key)) {
        seenIds.add(key);
        merged.push(a);
      }
    };

    inMemoryAlerts.forEach(processAlert);
    dbAlerts.forEach(processAlert);

    return res.status(200).json({
      success: true,
      count: merged.length,
      data: merged
    });
  } catch (error) {
    console.warn("GET /api/alerts warning:", error.message);
    return res.status(200).json({
      success: true,
      count: inMemoryAlerts.length,
      data: inMemoryAlerts
    });
  }
});

// @route   PUT /api/alerts/:id/resolve
// @desc    Resolve an alert by alert id or Mongo _id
router.put("/:id/resolve", async (req, res) => {
  try {
    const targetId = String(req.params.id);

    // Update in memory
    let resolvedItem = null;
    inMemoryAlerts.forEach((item) => {
      if (String(item.id) === targetId || String(item._id) === targetId) {
        item.status = "Resolved";
        resolvedItem = item;
      }
    });

    if (isDbConnected()) {
      try {
        const filter = mongoose.Types.ObjectId.isValid(req.params.id)
          ? { $or: [{ _id: req.params.id }, { id: req.params.id }] }
          : { id: req.params.id };

        const alert = await Alert.findOneAndUpdate(
          filter,
          { status: "Resolved" },
          { new: true }
        );
        if (alert) resolvedItem = alert;
      } catch (dbErr) {
        console.warn("MongoDB resolve warning:", dbErr.message);
      }
    }

    if (!resolvedItem) {
      return res.status(404).json({
        success: false,
        message: `Alert '${req.params.id}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: resolvedItem
    });
  } catch (error) {
    console.error(`PUT /api/alerts/${req.params.id}/resolve error:`, error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to resolve alert"
    });
  }
});

export default router;
