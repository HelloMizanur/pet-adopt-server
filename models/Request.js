import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    petName: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requesterName: String,
    requesterEmail: String,
    pickupDate: { type: Date, required: true },
    message: { type: String, default: "", maxlength: 1000 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
