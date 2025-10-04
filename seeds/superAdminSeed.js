// seeds/superAdminSeed.js
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../models/userModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/isp_management';

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const existing = await User.findOne({ email: 'superadmin@example.com' });
  if (existing) {
    console.log('Superadmin already exists');
    return process.exit(0);
  }

  const user = new User({
    name: 'Super Admin',
    email: 'superadmin@example.com',
    password: 'ChangeMe123!', // will be hashed automatically by pre-save
    role: 'superadmin',
    permissions: ['*']
  });
  await user.save();
  console.log('Created superadmin: superadmin@example.com / ChangeMe123!');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
