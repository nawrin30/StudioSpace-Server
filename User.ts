import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  photoURL: { type: String, default: "" },
  password: { type: String, required: true, select: false },
  wishlist: [{ type: Schema.Types.ObjectId, ref: "Studio" }],
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);
