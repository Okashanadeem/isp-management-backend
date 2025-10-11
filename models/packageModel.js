import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    speedMbps: {
      type: Number,
      required: true,
    },
    dataLimitGB: {
      type: Number,
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Package = mongoose.model("Package", packageSchema);
export default Package;
