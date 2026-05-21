import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    species: { type: String, required: true, trim: true, maxlength: 40 },
    breed: { type: String, default: "", maxlength: 80 },
    age: { type: String, default: "", maxlength: 30 },
    gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
    image: { type: String, required: true },
    healthStatus: { type: String, default: "" },
    vaccinated: { type: String, default: "" },
    location: { type: String, default: "" },
    fee: { type: Number, default: 0, min: 0 },
    description: { type: String, default: "", maxlength: 2000 },
    adopted: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerEmail: { type: String, required: true },
  },
  { timestamps: true }
);

petSchema.index({ name: "text", breed: "text", description: "text" });

export default mongoose.model("Pet", petSchema);
