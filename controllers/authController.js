import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';

const { sign } = jwt;


function createAccessToken(user) {
  return sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
}

// LOGIN
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
        data: null,
        timestamp: new Date().toISOString(),
      });

    if (!user.isActive)
      return res.status(403).json({
        success: false,
        message: 'User inactive',
        data: null,
        timestamp: new Date().toISOString(),
      });

    const ok = await user.matchPassword(password);
    if (!ok)
      return res.status(401).json({
        success: false,
        message: 'Incorrect password',
        data: null,
        timestamp: new Date().toISOString(),
      });

    user.lastLogin = new Date();
    await user.save();

    const accessToken = createAccessToken(user);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}

// LOGOUT
export async function logout(req, res, next) {
  try {
    return res.json({
      success: true,
      message: 'Logged out successfully',
      data: null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
}
