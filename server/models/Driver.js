import mongoose from "mongoose";

const driverSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true
    },
    driverId: {
      type: String,
      required: [true, "Driver ID is required"],
      unique: true,
      trim: true
    },
    profilePhoto: {
      type: String,
      default: ""
    },
    phoneNumber: {
      type: String,
      default: ""
    },
    licenseNumber: {
      type: String,
      default: ""
    },
    assignedVehicle: {
      type: String,
      default: ""
    },
    assignedRoute: {
      type: String,
      default: ""
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Active", "Inactive", "Suspended", "Safe", "Needs Attention"],
        message: "Status must be Active, Inactive, Suspended, Safe, or Needs Attention"
      },
      default: "Active"
    },
    safetyScore: {
      type: Number,
      default: 100
    },
    totalIncidents: {
      type: Number,
      default: 0
    },
    monitoringSessions: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Driver = mongoose.model("Driver", driverSchema);

export default Driver;
