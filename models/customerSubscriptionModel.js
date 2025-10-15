import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "pending", "suspended"],
      default: "pending",
    },
    autoRenewal: {
      type: Boolean,
      default: false,
    },
    renewalHistory: [
      {
        renewalDate: { type: Date },
        previousEndDate: { type: Date },
        newEndDate: { type: Date },
        renewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BranchAdmin", 
        },
      },
    ],
  },
  { timestamps: true }
);

const CustomerSubscription = mongoose.model(
  "CustomerSubscription",
  subscriptionSchema
);
export default CustomerSubscription;
