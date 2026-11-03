
import "dotenv/config";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth";
import studioRoutes from "./routes/studios";
import bookingRoutes from "./routes/bookings";
import wishlistRoutes from "./routes/wishlist";
import { connectDB } from "./config/db";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://studio-space-client-ruddy.vercel.app",
  process.env.CLIENT_URL?.replace(/\/$/, ""),
].filter((origin): origin is string => Boolean(origin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("Database connection failed:", error);
    res.status(500).json({ message: "Database connection failed." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "StudioSpace API" });
});

app.use("/api/auth", authRoutes);
app.use("/auth", authRoutes);

app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(error);
    res.status(500).json({ message: "Unexpected server error." });
  }
);

export default app;
