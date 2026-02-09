import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: { type: String, default: null },
    otpExpire: { type: Number, default: null },
    cartItems: { type: Object, default: {} },
  },
  { minimize: false },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
