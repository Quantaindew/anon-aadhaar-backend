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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 8080;

// Trust proxy
app.set('trust proxy', true);

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

app.use("/api/proof", proofRoutes);
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

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Error handling for the server
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('Server error:', error);
      // Log the error but don't exit
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  // Log the error but keep the server running
});

process.on('unhandledRejection', (reason: {} | null | undefined, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log the error but keep the server running
});