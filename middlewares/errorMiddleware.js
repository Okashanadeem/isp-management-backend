import logger from "../utils/logger.js";

export const errorMiddleware = (err, req, res, next) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};
