
import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MONGODB_URI is missing. Add it to environment variables.");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(connectionString);
  }

  try {
    await connectionPromise;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }

  console.log("MongoDB connected successfully.");
}
