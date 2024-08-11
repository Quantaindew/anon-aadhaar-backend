//@ts-nocheck
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import proofRoutes from "./routes/proofRoutes.js";
import connectRoutes from "./routes/connectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { downloadArtifacts } from "./utils/downloadArtifacts.js";
import v8 from 'v8';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set V8 flags for memory management
v8.setFlagsFromString('--max-old-space-size=4096');
v8.setFlagsFromString('--expose-gc');



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
const PORT = process.env.PORT || 8080;

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
  
  logMemoryUsage();
  console.log(`Request started: ${req.method} ${req.url}`);

  res.on('finish', () => {
    
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

async function checkAndDownloadArtifacts() {
  const artifactsDir = path.join(__dirname, 'public');
  const requiredArtifacts = ['aadhaar-verifier.wasm', 'vkey.json', 'circuit_final.zkey'];
  
  let missingArtifacts = false;
  
  for (const artifact of requiredArtifacts) {
    const artifactPath = path.join(artifactsDir, artifact);
    const exists = await fs.stat(artifactPath).then(() => true).catch(() => false);
    if (!exists) {
      missingArtifacts = true;
      break;
    }
  }

  if (missingArtifacts) {
    console.log('Some artifacts are missing. Downloading...');
    await downloadArtifacts();
  } else {
    console.log('All artifacts are present.');
  }
}

async function startServer() {
  try {
    await checkAndDownloadArtifacts();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Perform garbage collection and log memory usage every 5 minutes
setInterval(() => {
  
  logMemoryUsage();
}, 5 * 60 * 1000);

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  
  logMemoryUsage();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  
  logMemoryUsage();
});