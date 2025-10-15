import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import AppError from '../utils/AppError.js';
import ERROR_MESSAGES from '../utils/errors.js';

const { sign } = jwt;

// Create JWT access token
function createAccessToken(user) {
  return sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h',
  });
  return sign(
    { id: user._id, role: user.role, branch: user.branch }, // <-- add branch here
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m',
    }
  );
}
// LOGIN
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(
        new AppError(
          ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS.message,
          ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS.statusCode
        )
      );
    }

    if (!user.isActive) {
      return next(
        new AppError(
          ERROR_MESSAGES.AUTH.USER_INACTIVE.message,
          ERROR_MESSAGES.AUTH.USER_INACTIVE.statusCode
        )
      );
    }

    const ok = await user.matchPassword(password);
    if (!ok) {
      return next(
        new AppError(
          ERROR_MESSAGES.AUTH.INCORRECT_PASSWORD.message,
          ERROR_MESSAGES.AUTH.INCORRECT_PASSWORD.statusCode
        )
      );
    }

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
          branch: user.branch, // <-- add this line
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.message}: ${err.message}`,
        ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.statusCode
      )
    );
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
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.message}: ${err.message}`,
        ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.statusCode
      )
    );
  }
}

// PROFILE
export async function getProfile(req, res, next) {
  try {
    // req.user is set by auth middleware
    if (!req.user) {
      return next(
        new AppError(
          ERROR_MESSAGES.AUTH.UNAUTHORIZED.message,
          ERROR_MESSAGES.AUTH.UNAUTHORIZED.statusCode
        )
      );
    }

    const user = await User.findById(req.user.id).select('-password'); // exclude password

    if (!user) {
      return next(
        new AppError(
          ERROR_MESSAGES.AUTH.USER_NOT_FOUND.message,
          ERROR_MESSAGES.AUTH.USER_NOT_FOUND.statusCode
        )
      );
    }

    return res.json({
      success: true,
      message: 'User profile retrieved successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.message}: ${err.message}`,
        ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.statusCode
      )
    );
  }
}

// Middleware to protect routes
export function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer token

    if (!token) {
      return next(
        new AppError(
          ERROR_MESSAGES.AUTH.UNAUTHORIZED.message,
          ERROR_MESSAGES.AUTH.UNAUTHORIZED.statusCode
        )
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
      branch: decoded.branch, // <-- make sure this is set
    };

    next();
  } catch (err) {
    next(
      new AppError(
        `${ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.message}: ${err.message}`,
        ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR.statusCode
      )
    );
  }
}
