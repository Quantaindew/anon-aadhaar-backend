//@ts-nocheck
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proofRoutes from "./routes/proofRoutes.js";
import connectRoutes from "./routes/connectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import v8 from 'v8';

// Set V8 flags for memory management
v8.setFlagsFromString('--max-old-space-size=4096');
v8.setFlagsFromString('--expose-gc');

// Perform garbage collection
const performGC = () => {
  if (global.gc) {
    global.gc();
    console.log('Garbage collection performed');
  } else {
    console.log('Garbage collection not available');
  }
};

// Monitor memory usage
const logMemoryUsage = () => {
  const used = process.memoryUsage();
  console.log('Memory usage:');
  for (let key in used) {
    console.log(`${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
};

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3222;

// Add these lines to set global timeout and increase payload limit
app.use((req, res, next) => {
  res.setTimeout(300000, () => {
    res.status(408).send('Request has timed out');
  });
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin: "https://omelette-app.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Middleware to perform GC before and after each request, and log memory usage
app.use((req, res, next) => {
  performGC();
  logMemoryUsage();
  console.log(`Request started: ${req.method} ${req.url}`);

  res.on('finish', () => {
    performGC();
    logMemoryUsage();
    console.log(`Request finished: ${req.method} ${req.url}`);
  });

  next();
});

app.use("/api/proof", proofRoutes);
app.use("/api/connection", connectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/", (req, res) => {
  return res.json({ status: "OK" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Perform garbage collection and log memory usage every 5 minutes
setInterval(() => {
  performGC();
  logMemoryUsage();
}, 5 * 60 * 1000);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  performGC();
  logMemoryUsage();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  performGC();
  logMemoryUsage();
});