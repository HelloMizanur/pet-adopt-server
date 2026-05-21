import { Router } from "express";
import Pet from "../models/Pet.js";
import Request from "../models/Request.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Public: list with search/filter/sort
router.get("/", async (req, res, next) => {
  try {
    const { search, species, sort = "newest", adopted } = req.query;
    const q = {};
    if (search) q.name = { $regex: search, $options: "i" };
    if (species) {
      const list = String(species)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (list.length) q.species = { $in: list.map((s) => new RegExp(`^${s}$`, "i")) };
    }
    if (adopted === "false") q.adopted = false;
    if (adopted === "true") q.adopted = true;

    let sortObj = { createdAt: -1 };
    if (sort === "oldest") sortObj = { createdAt: 1 };
    if (sort === "fee_asc") sortObj = { fee: 1 };
    if (sort === "fee_desc") sortObj = { fee: -1 };

    const pets = await Pet.find(q).sort(sortObj).limit(200);
    res.json(pets);
  } catch (e) {
    next(e);
  }
});

router.get("/featured", async (_req, res, next) => {
  try {
    const pets = await Pet.find({ adopted: false }).sort({ createdAt: -1 }).limit(6);
    res.json(pets);
  } catch (e) {
    next(e);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json(pet);
  } catch (e) {
    next(e);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const body = req.body || {};
    const required = ["name", "species", "image"];
    for (const k of required) if (!body[k]) return res.status(400).json({ message: `${k} required` });

    const pet = await Pet.create({
      ...body,
      fee: Number(body.fee) || 0,
      owner: req.user._id,
      ownerEmail: req.user.email,
    });
    res.status(201).json(pet);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (String(pet.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });

    const fields = [
      "name",
      "species",
      "breed",
      "age",
      "gender",
      "image",
      "healthStatus",
      "vaccinated",
      "location",
      "fee",
      "description",
    ];
    for (const f of fields) if (f in req.body) pet[f] = req.body[f];
    pet.fee = Number(pet.fee) || 0;
    await pet.save();
    res.json(pet);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    if (String(pet.owner) !== String(req.user._id))
      return res.status(403).json({ message: "Forbidden" });
    await Promise.all([
      Pet.deleteOne({ _id: pet._id }),
      Request.deleteMany({ pet: pet._id }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
