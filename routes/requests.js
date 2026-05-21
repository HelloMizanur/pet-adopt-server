import { Router } from "express";
import Pet from "../models/Pet.js";
import Request from "../models/Request.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Submit adoption request
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { petId, pickupDate, message } = req.body || {};
    if (!petId || !pickupDate)
      return res.status(400).json({ message: "petId and pickupDate are required" });

    const pet = await Pet.findById(petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (pet.adopted) return res.status(400).json({ message: "Pet is already adopted" });
    if (String(pet.owner) === String(req.user._id))
      return res.status(400).json({ message: "Owners can't request their own pets" });

    const existing = await Request.findOne({
      pet: pet._id,
      requester: req.user._id,
      status: { $in: ["pending", "approved"] },
    });
    if (existing) return res.status(409).json({ message: "You already requested this pet" });

    const r = await Request.create({
      pet: pet._id,
      petName: pet.name,
      owner: pet.owner,
      requester: req.user._id,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      pickupDate,
      message: message || "",
    });
    res.status(201).json(r);
  } catch (e) {
    next(e);
  }
});

// My adoption requests
router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const list = await Request.find({ requester: req.user._id })
      .populate("pet", "name image species")
      .sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// Requests for a pet I own
router.get("/for-pet/:petId", requireAuth, async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.petId);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (String(pet.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    const list = await Request.find({ pet: pet._id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// Cancel my request
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Request not found" });
    if (String(r.requester) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    await Request.deleteOne({ _id: r._id });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Approve / reject (owner only)
router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const r = await Request.findById(req.params.id);
    if (!r) return res.status(404).json({ message: "Request not found" });
    if (String(r.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    if (r.status !== "pending")
      return res.status(400).json({ message: "Already decided" });

    if (status === "approved") {
      const pet = await Pet.findById(r.pet);
      if (!pet) return res.status(404).json({ message: "Pet not found" });
      if (pet.adopted) return res.status(400).json({ message: "Pet already adopted" });
      pet.adopted = true;
      await pet.save();
      // auto-reject all other pending
      await Request.updateMany(
        { pet: pet._id, _id: { $ne: r._id }, status: "pending" },
        { $set: { status: "rejected" } }
      );
    }
    r.status = status;
    await r.save();
    res.json(r);
  } catch (e) {
    next(e);
  }
});

export default router;
