import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    studio: {
      type: Schema.Types.ObjectId,
      ref: "Studio",
      required: true,
    },
    userEmail: { type: String, required: true, lowercase: true },
    userName: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
