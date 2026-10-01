import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Vehicle from "./models/Vehicle.js";

// Load environment variables
dotenv.config();

const initialVehicles = [
  {
    vehicleId: "VEH-001",
    regNumber: "KA-01-MJ-4829",
    model: "Toyota HiAce (Delivery Van)",
    assignedDriverId: "DRV-001",
    assignedDriverName: "Arun Kumar",
    route: "North Metro Delivery Route",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9402"
  },
  {
    vehicleId: "VEH-002",
    regNumber: "KA-05-MH-9102",
    model: "Volvo FH16 (Long Haul Truck)",
    assignedDriverId: "DRV-002",
    assignedDriverName: "Kumar",
    route: "Interstate Highway Corridor 4",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9399"
  },
  {
    vehicleId: "VEH-003",
    regNumber: "KA-03-MK-2041",
    model: "Isuzu ELF (Freight Transport)",
    assignedDriverId: "DRV-003",
    assignedDriverName: "Ravi",
    route: "South Zone Logistics Loop",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9401"
  },
  {
    vehicleId: "VEH-004",
    regNumber: "KA-04-MP-8833",
    model: "Tata Prima (Heavy Cargo Carrier)",
    assignedDriverId: "DRV-004",
    assignedDriverName: "Suresh",
    route: "East Freight Ring Road",
    systemStatus: "Active & Monitored",
    lastActiveSession: "MS-9400"
  }
];

const seedVehicles = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in server/.env");
      process.exit(1);
    }

    await connectDB();

    console.log("Seeding vehicle records into MongoDB Atlas...");
    let insertedCount = 0;
    let skippedCount = 0;

    for (const vehicleData of initialVehicles) {
      const existing = await Vehicle.findOne({ vehicleId: vehicleData.vehicleId });
      if (!existing) {
        await Vehicle.create(vehicleData);
        console.log(`+ Inserted vehicle: ${vehicleData.model} (${vehicleData.vehicleId})`);
        insertedCount++;
      } else {
        console.log(`= Vehicle already exists (skipped): ${vehicleData.model} (${vehicleData.vehicleId})`);
        skippedCount++;
      }
    }

    console.log(`\nVehicle seed completed successfully: ${insertedCount} inserted, ${skippedCount} skipped.`);
  } catch (error) {
    console.error("Error seeding vehicle database:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

seedVehicles();
