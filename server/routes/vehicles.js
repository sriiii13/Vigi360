import express from "express";
import mongoose from "mongoose";
import Vehicle from "../models/Vehicle.js";

const router = express.Router();

// Helper function to find vehicle by _id or vehicleId
const findVehicleByIdParam = async (idParam) => {
  if (mongoose.Types.ObjectId.isValid(idParam)) {
    const vehicle = await Vehicle.findById(idParam);
    if (vehicle) return vehicle;
  }
  return await Vehicle.findOne({ vehicleId: idParam });
};

// @route   POST /api/vehicles
// @desc    Create a new vehicle
router.post("/", async (req, res) => {
  try {
    const { vehicleId, regNumber, model } = req.body;

    if (!vehicleId || !regNumber || !model) {
      return res.status(400).json({
        success: false,
        message: "vehicleId, regNumber, and model are required fields"
      });
    }

    // Check for existing vehicleId
    const existingVehicle = await Vehicle.findOne({ vehicleId: vehicleId.trim() });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: `Vehicle with vehicleId '${vehicleId}' already exists`
      });
    }

    const newVehicle = new Vehicle(req.body);
    const savedVehicle = await newVehicle.save();

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: savedVehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate vehicleId value entered"
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   GET /api/vehicles
// @desc    Get all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get vehicle by _id or vehicleId
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await findVehicleByIdParam(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle not found with id '${req.params.id}'`
      });
    }

    return res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle by _id or vehicleId
router.put("/:id", async (req, res) => {
  try {
    const targetVehicle = await findVehicleByIdParam(req.params.id);

    if (!targetVehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle not found with id '${req.params.id}'`
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      targetVehicle._id,
      req.body,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate vehicleId value entered"
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Server Error"
    });
  }
});

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle by _id or vehicleId
router.delete("/:id", async (req, res) => {
  try {
    const targetVehicle = await findVehicleByIdParam(req.params.id);

    if (!targetVehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle not found with id '${req.params.id}'`
      });
    }

    await Vehicle.findByIdAndDelete(targetVehicle._id);

    return res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
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
