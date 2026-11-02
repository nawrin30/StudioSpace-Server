import mongoose, { Schema } from "mongoose";

const studioSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    hourlyRate: { type: Number, required: true, min: 0 },
    securityDeposit: { type: Number, default: 0, min: 0 },
    maxCapacity: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    amenities: { type: [String], default: [] },
    overview: { type: String, required: true, trim: true },
    ownerEmail: { type: String, required: true, lowercase: true },
    ownerName: { type: String, required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true },
);

export default mongoose.models.Studio || mongoose.model("Studio", studioSchema);
