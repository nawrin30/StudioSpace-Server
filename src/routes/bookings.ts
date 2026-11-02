import { Router } from "express";
import Booking from "../models/Booking";
import Studio from "../models/Studio";
import { protect, type AuthRequest } from "../middleware/auth";

const router = Router();
const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

router.get("/mine", protect, async (req: AuthRequest, res) => {
  const bookings = await Booking.find({ userEmail: req.user!.email })
    .populate("studio", "title imageUrl location ownerEmail")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

router.get("/host", protect, async (req: AuthRequest, res) => {
  const owned = await Studio.find({ ownerEmail: req.user!.email }).select("_id");
  const bookings = await Booking.find({ studio: { $in: owned.map((item) => item._id) } })
    .populate("studio", "title imageUrl location ownerEmail")
    .sort({ createdAt: -1 });
  res.json(bookings);
});

router.post("/", protect, async (req: AuthRequest, res) => {
  try {
    const { studioId, date, startTime, endTime } = req.body as { studioId?: string; date?: string; startTime?: string; endTime?: string };
    if (!studioId || !date || !startTime || !endTime) {
      res.status(400).json({ message: "Studio, date, start time and end time are required." }); return;
    }
    const start = toMinutes(startTime), end = toMinutes(endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 1440 || end <= start) {
      res.status(400).json({ message: "Choose a valid time range." }); return;
    }
    if (date < new Date().toISOString().slice(0, 10)) {
      res.status(400).json({ message: "Booking date cannot be in the past." }); return;
    }
    const studio = await Studio.findById(studioId);
    if (!studio) { res.status(404).json({ message: "Studio not found." }); return; }
    if (studio.ownerEmail === req.user!.email) {
      res.status(400).json({ message: "You cannot book your own studio." }); return;
    }
    // Pending requests do not block slots; only confirmed bookings reserve time.
    const confirmed = await Booking.find({ studio: studioId, date, status: "Confirmed" });
    const collision = confirmed.some((item) => start < toMinutes(item.endTime) && end > toMinutes(item.startTime));
    if (collision) { res.status(409).json({ message: "This slot overlaps a confirmed booking. Choose another time." }); return; }
    const booking = await Booking.create({ studio: studioId, userEmail: req.user!.email, userName: req.user!.name, date, startTime, endTime, totalPrice: ((end - start) / 60) * studio.hourlyRate, status: "Pending" });
    res.status(201).json(booking);
  } catch (error) { console.error("Create booking error:", error); res.status(400).json({ message: "Could not create this booking." }); }
});

router.patch("/:id/cancel", protect, async (req: AuthRequest, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, userEmail: req.user!.email });
  if (!booking) { res.status(404).json({ message: "Booking not found." }); return; }
  if (booking.status !== "Pending") { res.status(400).json({ message: "Only pending bookings can be cancelled." }); return; }
  booking.status = "Cancelled"; await booking.save(); res.json(booking);
});

router.patch("/:id/status", protect, async (req: AuthRequest, res) => {
  const status = String(req.body.status || "");
  if (!["Confirmed", "Completed", "Cancelled"].includes(status)) { res.status(400).json({ message: "Invalid booking status." }); return; }
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404).json({ message: "Booking not found." }); return; }
  const studio = await Studio.findById(booking.studio);
  if (!studio || studio.ownerEmail !== req.user!.email) { res.status(403).json({ message: "Only the studio host can update this booking." }); return; }
  if (status === "Confirmed") {
    const start = toMinutes(booking.startTime), end = toMinutes(booking.endTime);
    const conflict = await Booking.find({ _id: { $ne: booking._id }, studio: booking.studio, date: booking.date, status: "Confirmed" });
    if (conflict.some((item) => start < toMinutes(item.endTime) && end > toMinutes(item.startTime))) {
      res.status(409).json({ message: "Cannot confirm: this time overlaps another confirmed booking." }); return;
    }
  }
  booking.status = status as typeof booking.status; await booking.save(); res.json(booking);
});

export default router;
