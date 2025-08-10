import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Content = mongoose.model("Content", contentSchema);
