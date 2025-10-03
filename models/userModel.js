
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 


const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '5');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
}, { timestamps: true });


userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
  this.password = hash;
  next();
});


const User = mongoose.model('User', userSchema);



const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export { User, RefreshToken };
