import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import driverRoutes from "./routes/drivers.js";
import vehicleRoutes from "./routes/vehicles.js";
import alertRoutes from "./routes/alerts.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn("Warning: MONGO_URI is not defined in .env file. Database connection skipped.");
}

// Module Routes
app.use("/api/drivers", driverRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/alerts", alertRoutes);

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Vigi360 backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`Vigi360 server running on port ${PORT}`);
});
