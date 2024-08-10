import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import proofRoutes from "./routes/proofRoutes.js";
import connectRoutes from "./routes/connectRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = 8080;

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(
  cors({
    origin: ["https://omelette-app.vercel.app", "https://184.105.118.135"],
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

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Optionally, you can choose to exit the process here
  // process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, you can choose to exit the process here
  // process.exit(1);
});