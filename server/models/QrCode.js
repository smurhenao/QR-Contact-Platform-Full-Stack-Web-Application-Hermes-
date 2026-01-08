import mongoose from "mongoose";

const qrSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["whatsapp", "instagram", "custom"], default: "whatsapp" },
  destinationUrl: { type: String, required: true },
  shortCode: { type: String, unique: true },
  qrImage: { type: String }, 
  scanCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },

  color: { type: String, default: "#000000" },
  bgColor: { type: String, default: "#ffffff" }
});

export default mongoose.model("QrCode", qrSchema);