import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    driverId: {
      type: String,
      default: "DRV-001"
    },
    driverName: {
      type: String,
      default: "Arun Kumar"
    },
    vehicleId: {
      type: String,
      default: "VEH-001"
    },
    type: {
      type: String,
      required: true,
      default: "Severe Drowsiness"
    },
    severity: {
      type: String,
      required: true,
      enum: ["CRITICAL", "HIGH", "WARNING"],
      default: "CRITICAL"
    },
    drowsinessScore: {
      type: Number,
      default: 80
    },
    closureDuration: {
      type: Number,
      default: 0
    },
    details: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["Unresolved", "Resolved"],
      default: "Unresolved"
    },
    timestamp: {
      type: String,
      default: () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " (Live)"
    }
  },
  {
    timestamps: true
  }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;
