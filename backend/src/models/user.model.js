import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import variables from "../global/variables.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: true,
    },
    attemptsRemaining: {
      type: Number,
      default: variables.MAX_LOGIN_ATTEMPTS,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isSubscribed: this.isSubscribed,
    },
    variables.JWT_SECRET,
    { expiresIn: variables.JWT_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
