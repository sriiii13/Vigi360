import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Driver from "./models/Driver.js";

// Load environment variables
dotenv.config();

const initialDrivers = [
  {
    driverId: "DRV-001",
    fullName: "Arun Kumar",
    assignedVehicle: "VEH-001",
    status: "Safe",
    safetyScore: 92,
    phoneNumber: "+91 98765 43210",
    licenseNumber: "DL-142011009876",
    assignedRoute: "North Metro Delivery Route",
    joiningDate: new Date("2023-04-15"),
    profilePhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8aln8cU27xfa2_ZQU7EenMc-ExevzFDr19EuQCWuSeQEL-p0NIVHVcbNbxUpqRVUc9eGFZiDPbivKKc0nLY1djatrfW6UT1xq6cMl7LP8V3ijKkTLpyhUFKtJ-KoQTQdzeAtjstVNHgYhzC3oknDoCcDvr1q9ztXTZG755WyXWk20XLWyo_6j0HzeQcs-8I8slJcAHtxjvyvw-eM60RrOaIqgDEqhCoAytYqxrJ8z2pLeYMX4ZWBdLw",
    monitoringSessions: 18,
    totalIncidents: 1
  },
  {
    driverId: "DRV-002",
    fullName: "Kumar",
    assignedVehicle: "VEH-002",
    status: "Needs Attention",
    safetyScore: 74,
    phoneNumber: "+91 98765 12345",
    licenseNumber: "DL-142011005432",
    assignedRoute: "Interstate Highway Corridor 4",
    joiningDate: new Date("2022-11-01"),
    profilePhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuDHpMb44pZ5JyR6VFvtGkOlq4cno4ngMLF3-tPmxvZApvfrfocKm463X2OTbTz5LaUor-16griDgyJmelhp-6LgEx5vc2J5Ip8hly4hVEQJvwU8YkM-Omr0Lqivv3Azq0W7rmBwpLNp1qoWK1S96pAZ1IGA1Q2LaeX13eH7QhJyor5o9cYpf6S_RfBQrn1lpMGrUtvlvjIxRVH97frfBYre7X3hK5Q87NWI8k9Iw80JKzLvMeTmebRI9w",
    monitoringSessions: 15,
    totalIncidents: 3
  },
  {
    driverId: "DRV-003",
    fullName: "Ravi",
    assignedVehicle: "VEH-003",
    status: "Safe",
    safetyScore: 88,
    phoneNumber: "+91 98765 67890",
    licenseNumber: "DL-142011006789",
    assignedRoute: "South Zone Logistics Loop",
    joiningDate: new Date("2024-01-10"),
    profilePhoto: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmfEuAmCtj-0K-yMYQ1woNubAQzYL7DYHFK18yBpHjEdgA4R6NmBpzziCxNPmnZWMi6MXZxnvwYW5bqQzsOZPgYe41icI_kPNwyvX1gGJK2yC5tY-48snUx8R-nlbmGKlZXta4YOrU-UYrKoIkVoRlOafGbXCk41WKP-7Co66y5Aw8ihkaLYwIXF9KNO656w49K7goOsLplH4FLJW7Og52fahnY05F_4EqXFT9zhVfRnRaTw4cCu5IcQ",
    monitoringSessions: 20,
    totalIncidents: 0
  },
  {
    driverId: "DRV-004",
    fullName: "Suresh",
    assignedVehicle: "VEH-004",
    status: "Needs Attention",
    safetyScore: 65,
    phoneNumber: "+91 98765 99988",
    licenseNumber: "DL-142011009988",
    assignedRoute: "East Freight Ring Road",
    joiningDate: new Date("2023-08-20"),
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    monitoringSessions: 14,
    totalIncidents: 5
  }
];

const seedDrivers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Error: MONGO_URI is not defined in server/.env");
      process.exit(1);
    }

    await connectDB();

    console.log("Seeding driver records into MongoDB Atlas...");
    let insertedCount = 0;
    let skippedCount = 0;

    for (const driverData of initialDrivers) {
      const existing = await Driver.findOne({ driverId: driverData.driverId });
      if (!existing) {
        await Driver.create(driverData);
        console.log(`+ Inserted driver: ${driverData.fullName} (${driverData.driverId})`);
        insertedCount++;
      } else {
        console.log(`= Driver already exists (skipped): ${driverData.fullName} (${driverData.driverId})`);
        skippedCount++;
      }
    }

    console.log(`\nDriver seed completed successfully: ${insertedCount} inserted, ${skippedCount} skipped.`);
  } catch (error) {
    console.error("Error seeding driver database:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

seedDrivers();
