import jwt from "jsonwebtoken";
import ERROR_MESSAGES from "../utils/errors.js";
import AppError from "../utils/AppError.js";

export const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new AppError(ERROR_MESSAGES.AUTH.UNAUTHORIZED_ACCESS));
      }

      const token = authHeader.split(" ")[1];
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return next(new AppError(ERROR_MESSAGES.AUTH.TOKEN_EXPIRED));
      }

      req.user = decoded;

      if (!allowedRoles.includes(decoded.role)) {
        return next(new AppError(ERROR_MESSAGES.AUTH.UNAUTHORIZED_ACCESS));
      }

      next();
    } catch (error) {
      next(new AppError(ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR, error.message));
    }
  };
};
