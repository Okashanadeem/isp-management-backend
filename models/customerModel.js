import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  personalInfo: {
    name: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    hashPassword: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, required: true, trim: true },
  },

  documents: [
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      path: { type: String, required: true },
      mimetype: { type: String },
      size: { type: Number },
      uploadedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

// indexes for unique fields
customerSchema.index({ "personalInfo.email": 1 }, { unique: true });
customerSchema.index({ "personalInfo.cnic": 1 }, { unique: true });
customerSchema.index({ "personalInfo.phone": 1 }, { unique: true });

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;
