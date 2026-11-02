
import { Router } from "express";
import mongoose, { Types } from "mongoose";
import User from "../models/User";
import Studio from "../models/Studio";
import { protect, type AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", protect, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id).populate("wishlist");
  res.json(user?.wishlist || []);
});

router.post("/:studioId", protect, async (req: AuthRequest, res) => {
  if (!mongoose.isValidObjectId(req.params.studioId)) {
    res.status(400).json({ message: "Invalid studio ID." });
    return;
  }

  const studio = await Studio.findById(req.params.studioId);

  if (!studio) {
    res.status(404).json({ message: "Studio not found." });
    return;
  }

  const user = await User.findById(req.user!.id);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  const exists = user.wishlist.some(
    (id: Types.ObjectId) => id.toString() === req.params.studioId
  );

  if (!exists) {
    user.wishlist.push(studio._id);
  }

  await user.save();
  res.json({ saved: true });
});

router.delete("/:studioId", protect, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id);

  if (!user) {
    res.status(404).json({ message: "User not found." });
    return;
  }

  user.wishlist = user.wishlist.filter(
    (id: Types.ObjectId) => id.toString() !== req.params.studioId
  ) as typeof user.wishlist;

  await user.save();
  res.json({ saved: false });
});

export default router;
