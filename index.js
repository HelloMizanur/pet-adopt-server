import "dotenv/config";

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import petRoutes from "./routes/pets.js";
import requestRoutes from "./routes/requests.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:3000").split(","),
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

/*
|--------------------------------------------------------------------------
| MongoDB Connection
|--------------------------------------------------------------------------
*/

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI missing");
}

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGO_URI);

    isConnected = true;

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB error:", error);
    throw error;
  }
}

/*
|--------------------------------------------------------------------------
| Connect DB Before Requests
|--------------------------------------------------------------------------
*/

app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    name: "Pet Adoption API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/requests", requestRoutes);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((err, _req, res, _next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

export default app;
