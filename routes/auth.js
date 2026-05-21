import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { signToken, cookieOptions, requireAuth } from "../middleware/auth.js";

const router = Router();

const passwordOk = (p) =>
  typeof p === "string" && p.length >= 6 && /[A-Z]/.test(p) && /[a-z]/.test(p);

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, photoURL } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });
    if (!passwordOk(password))
      return res
        .status(400)
        .json({ message: "Password needs 6+ chars, one uppercase and one lowercase letter" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      photoURL: photoURL || "",
    });

    const token = signToken(user);
    res.cookie("token", token, cookieOptions());
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
      token,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user);
    res.cookie("token", token, cookieOptions());
    res.json({
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
      token,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token", { ...cookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

router.get("/me", requireAuth, (req, res) => {
  const u = req.user;
  res.json({ user: { id: u._id, name: u.name, email: u.email, photoURL: u.photoURL } });
});

export default router;
