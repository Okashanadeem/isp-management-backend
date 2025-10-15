import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      geolocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true,
        },
      },
    },

    bandwidth: {
      allocated: {
        type: Number,
        required: true,
        default: 0,
      },
      used: {
        type: Number,
        default: 0,
      },
      remaining: {
        type: Number,
        default: function () {
          return this.bandwidth.allocated - this.bandwidth.used;
        },
      },
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
  },
  { timestamps: true }
);

branchSchema.pre("save", function (next) {
  this.bandwidth.remaining = this.bandwidth.allocated - this.bandwidth.used;
  next();
});

branchSchema.index({ "location.geolocation": "2dsphere" });

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
