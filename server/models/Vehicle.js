import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: [true, "Vehicle ID is required"],
      unique: true,
      trim: true
    },
    regNumber: {
      type: String,
      required: [true, "Registration number is required"],
      trim: true
    },
    model: {
      type: String,
      required: [true, "Vehicle model is required"],
      trim: true
    },
    assignedDriverId: {
      type: String,
      default: ""
    },
    assignedDriverName: {
      type: String,
      default: ""
    },
    route: {
      type: String,
      default: ""
    },
    systemStatus: {
      type: String,
      enum: {
        values: ["Active & Monitored", "Maintenance", "Inactive"],
        message: "Status must be Active & Monitored, Maintenance, or Inactive"
      },
      default: "Active & Monitored"
    },
    lastActiveSession: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
