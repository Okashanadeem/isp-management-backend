import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import adminRoutes from './routes/adminRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

// Middlewares
import AppError from "./utils/AppError.js";

// CronJob
// import SubscriptionMonitor from "./config/cron.js";

// Logger
import logger from "./utils/logger.js";

// Load environment variables
dotenv.config();

// Resolve __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware Setup
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(cors());

// Use morgan for request logging (HTTP logs)
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()), // send HTTP logs to winston
    },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================
// API ROUTES
// ============================================
app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);

// Root Route
app.get("/", (req, res) => {
  res.send("ISP Management Backend Running...");
});

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error(`MongoDB connection failed: ${err.message}`));

// 404 Handler - Must be after all routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: `Route ${req.method} ${req.originalUrl} not found`
    }
  });
});

// Error Handling Middleware - Must be last
app.use(AppError);

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on: http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});