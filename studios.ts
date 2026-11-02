import { Router } from "express";
import Studio from "../models/Studio";
import { protect, type AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const filter: Record<string, unknown> = {};
  const category = String(req.query.category || "").trim();
  const query = String(req.query.q || "").trim();

  if (category) filter.category = category;
  if (query) {
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { title: { $regex: safeQuery, $options: "i" } },
      { location: { $regex: safeQuery, $options: "i" } },
      { category: { $regex: safeQuery, $options: "i" } },
    ];
  }

  const studios = await Studio.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(studios);
});

router.get("/featured", async (_req, res) => {
  const featuredStudios = await Studio.find()
    .sort({ rating: -1, createdAt: -1 })
    .limit(6);
  res.json(featuredStudios);
});

router.get("/mine", protect, async (req: AuthRequest, res) => {
  const studios = await Studio.find({ ownerEmail: req.user!.email }).sort({
    createdAt: -1,
  });
  res.json(studios);
});

router.get("/:id", async (req, res) => {
  const studio = await Studio.findById(req.params.id);
  if (!studio) {
    res.status(404).json({ message: "Studio not found." });
    return;
  }
  res.json(studio);
});

router.post("/", protect, async (req: AuthRequest, res) => {
  try {
    const studio = await Studio.create({
      ...req.body,
      ownerEmail: req.user!.email,
      ownerName: req.user!.name,
    });
    res.status(201).json(studio);
  } catch (error) {
    console.error("Create studio error:", error);
    res.status(400).json({ message: "Please provide valid studio details." });
  }
});

router.patch("/:id", protect, async (req: AuthRequest, res) => {
  const { ownerEmail: _ownerEmail, ownerName: _ownerName, ...updates } = req.body as Record<string, unknown>;
  const studio = await Studio.findOneAndUpdate(
    { _id: req.params.id, ownerEmail: req.user!.email },
    updates,
    { new: true, runValidators: true },
  );

  if (!studio) {
    res.status(404).json({ message: "Listing not found or you do not own it." });
    return;
  }
  res.json(studio);
});

router.delete("/:id", protect, async (req: AuthRequest, res) => {
  const studio = await Studio.findOneAndDelete({
    _id: req.params.id,
    ownerEmail: req.user!.email,
  });

  if (!studio) {
    res.status(404).json({ message: "Listing not found or you do not own it." });
    return;
  }
  res.json({ message: "Studio listing deleted." });
});

export default router;
