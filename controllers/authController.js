import jwt from 'jsonwebtoken';
import { User, RefreshToken } from '../models/userModel.js';

const { sign, decode, verify } = jwt;


function createAccessToken(user) {
  return sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });
}


function createRefreshToken(user) {
  return sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
}


export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials', data: null, timestamp: new Date().toISOString() });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'User inactive', data: null, timestamp: new Date().toISOString() });

    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ success: false, message: 'Incorrect password', data: null, timestamp: new Date().toISOString() });

  
    user.lastLogin = new Date();
    await user.save();

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);

  
    const decoded = decode(refreshToken);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 7*24*60*60*1000);
    await RefreshToken.create({ user: user._id, token: refreshToken, expiresAt });


    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: accessToken,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
}


export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required', data: null, timestamp: new Date().toISOString() });

    let decoded;
    try {
      decoded = verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Refresh token invalid or expired', data: null, timestamp: new Date().toISOString() });
    }

    
    const stored = await RefreshToken.findOne({ user: decoded.id, token: refreshToken });
    if (!stored) return res.status(401).json({ success: false, message: 'Refresh token not recognized', data: null, timestamp: new Date().toISOString() });

      const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null, timestamp: new Date().toISOString() });

  
    const accessToken = createAccessToken(user);

    return res.json({
      success: true,
      message: 'Token refreshed',
      data: { token: accessToken },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
}


export async function logout(req, res, next) {
  try {
   
    const { refreshToken } = req.body || {};
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
    }
    
    if (req.user && req.user._id) {
      await RefreshToken.deleteMany({ user: req.user._id });
    }

    return res.json({ success: true, message: 'Logged out', data: null, timestamp: new Date().toISOString() });
  } catch (err) {
    next(err);
  }
}


