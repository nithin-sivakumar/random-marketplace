import mongoose from "mongoose";

const restrictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isLocked: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 300 * 1000),
    expires: 0,
  },
});

export const Restriction = mongoose.model("Restriction", restrictionSchema);
