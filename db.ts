import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const connectionString = process.env.MONGODB_URI;

  if (!connectionString) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env.");
  }

  await mongoose.connect(connectionString);
  console.log("MongoDB connected successfully.");
}
