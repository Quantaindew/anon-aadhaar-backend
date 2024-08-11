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
import http from 'http';
import { Worker } from 'worker_threads';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 8080;

// Simple job tracking
const jobs = new Map();

// Create a worker for proof generation
const worker = new Worker('./proofWorker.js');

worker.on('message', (result) => {
  console.log('Proof generation completed:', result);
  if (result.jobId) {
    jobs.set(result.jobId, { status: 'completed', result: result.proof });
  }
});

worker.on('error', (error) => {
  console.error('Worker error:', error);
});

worker.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Worker stopped with exit code ${code}`);
  }
});

app.set('trust proxy', true);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin: ["https://omelette-app.vercel.app", "https://omelette.discloud.app"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Modify proof routes to use the worker
app.use("/api/proof", (req, res, next) => {
  if (req.method === 'POST' && req.path === '/generate') {
    const jobId = Date.now().toString();
    jobs.set(jobId, { status: 'pending' });
    worker.postMessage({ ...req.body, jobId });
    res.json({ jobId, message: 'Proof generation started' });
  } else {
    proofRoutes(req, res, next);
  }
});

// Add a new route to check proof generation status
app.get("/api/proof/status/:jobId", (req, res) => {
  const jobId = req.params.jobId;
  const job = jobs.get(jobId);
  
  if (!job) {
    res.status(404).json({ error: 'Job not found' });
  } else {
    res.json({ jobId, ...job });
  }
});

app.use("/api/connection", connectRoutes);
app.use("/api/user", userRoutes);

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

    const server = http.createServer(app);

    server.keepAliveTimeout = 120000; // 2 minutes
    server.headersTimeout = 120000; // 2 minutes

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('Server error:', error);
    });

  } catch (error) {
    console.error('Failed to start server:', error);

  }
}

startServer();

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason: {} | null | undefined, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});