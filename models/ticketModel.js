import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "technical",
        "billing",
        "customer_support",
        "infrastructure",
        "other",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "pending", "resolved", "closed"],
      default: "open",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    statusHistory: [
      {
        status: {
          type: String,
          enum: ["open", "in_progress", "pending", "resolved", "closed"],
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },

    attachments: [
      {
        filename: String,
        filepath: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/* 🔹 Auto-generate ticket number before saving */
ticketSchema.pre("save", async function (next) {
  if (this.ticketNumber) return next();

  try {
    // use branch-based sequence for uniqueness
    const branchPrefix = this.branch
      ? this.branch.toString().slice(-4).toUpperCase()
      : "GEN";

    const timestamp = Date.now().toString().slice(-6);
    const randomPart = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    this.ticketNumber = `TKT-${branchPrefix}-${timestamp}-${randomPart}`;
    next();
  } catch (err) {
    next(err);
  }
});

/* 🔹 Helpful indexes for faster queries */
ticketSchema.index({ branch: 1, status: 1 });
ticketSchema.index({ createdBy: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
