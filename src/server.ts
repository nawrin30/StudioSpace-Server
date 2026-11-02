import "dotenv/config";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);


import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import studioRoutes from "./routes/studios";
import bookingRoutes from "./routes/bookings";
import wishlistRoutes from "./routes/wishlist";

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "StudioSpace API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use(
  (error: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ message: "Unexpected server error." });
  },
);

const port = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`StudioSpace API is running at http://localhost:${port}`);
    });
  })
  .catch((error: unknown) => {
    console.error("Could not start StudioSpace API:", error);
    process.exit(1);
  });
