import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import redisConnection from "./config/redis.js";
import emailRoutes from "./routes/emailRoutes.js";
import emailWorker from "./workers/emailWorker.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.send("ReachInbox Email Scheduler Backend is running!");
});

// Health check route
app.get("/health", async (req, res) => {
  try {
    const redisStatus = await redisConnection.ping();

    res.json({
      status: "OK",
      redis: redisStatus,
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
});

// Email routes
app.use("/api/emails", emailRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});