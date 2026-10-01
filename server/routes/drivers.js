import express from "express";
import mongoose from "mongoose";
import Driver from "../models/Driver.js";

const router = express.Router();

// Helper function to find driver by _id or driverId
const findDriverByIdParam = async (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const driver = await Driver.findById(idParam);
    if (driver) return driver;
  }
  return await Driver.findOne({ driverId: idParam });
};

// @route   POST /api/drivers
// @desc    Create a new driver
router.post("/", async (req, res) => {
  try {
    const { fullName, driverId } = req.body;

    if (!fullName || !driverId) {
      return res.status(400).json({
        success: false,
        message: "fullName and driverId are required fields"
      });
    }

    // Check for existing driverId
    const existingDriver = await Driver.findOne({ driverId: driverId.trim() });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: `Driver with driverId '${driverId}' already exists`
      });
    }

    const newDriver = new Driver(req.body);
    const savedDriver = await newDriver.save();

    return res.status(201).json({
      success: true,
      message: "Driver created successfully",
      data: savedDriver
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate driverId value entered"
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   GET /api/drivers
// @desc    Get all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    console.warn("GET /api/drivers database warning:", error.message);
    return res.status(200).json({
      success: false,
      message: error.message || "Server Error",
      count: 0,
      data: []
    });
  }
});

// @route   GET /api/drivers/:id
// @desc    Get driver by _id or driverId
router.get("/:id", async (req, res) => {
  try {
    const driver = await findDriverByIdParam(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: `Driver not found with id '${req.params.id}'`
      });
    }

    return res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   PUT /api/drivers/:id
// @desc    Update driver by _id or driverId
router.put("/:id", async (req, res) => {
  try {
    const targetDriver = await findDriverByIdParam(req.params.id);

    if (!targetDriver) {
      return res.status(404).json({
        success: false,
        message: `Driver not found with id '${req.params.id}'`
      });
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      targetDriver._id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Driver updated successfully",
      data: updatedDriver
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate driverId value entered"
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   DELETE /api/drivers/:id
// @desc    Delete driver by _id or driverId
router.delete("/:id", async (req, res) => {
  try {
    const targetDriver = await findDriverByIdParam(req.params.id);

    if (!targetDriver) {
      return res.status(404).json({
        success: false,
        message: `Driver not found with id '${req.params.id}'`
      });
    }

    await Driver.findByIdAndDelete(targetDriver._id);

    return res.status(200).json({
      success: true,
      message: "Driver deleted successfully",
      data: {}
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

export default router;
