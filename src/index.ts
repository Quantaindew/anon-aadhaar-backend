import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proofRoutes from "./routes/proofRoutes.js";
import connectRoutes from "./routes/connectRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = 8080;

// Global variable to track proof generation progress
let proofProgress = 0;

app.use((req, res, next) => {
  res.setTimeout(900000, () => { // 15 minutes
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

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'pong', timestamp: new Date().toISOString() });
});

// New endpoint to check proof generation progress
app.get('/progress', (req, res) => {
  res.status(200).json({ progress: proofProgress });
});

// Middleware to reset progress before starting a new proof generation
app.use("/api/proof", (req, res, next) => {
  proofProgress = 0;
  next();
}, proofRoutes);

app.use("/api/connection", connectRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export a function to update progress (to be used in the prove function)
export function updateProgress(progress: number) {
  proofProgress = progress;
}