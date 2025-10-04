const SYSTEM_ERRORS = {
  UNKNOWN_ERROR: {
    code: "SYSTEM_UNKNOWN_ERROR",
    status: 500,
    statusCode: 500, // added
    message: "Something went wrong",
  },
  DATABASE_ERROR: {
    code: "SYSTEM_DATABASE_ERROR",
    status: 500,
    statusCode: 500,
    message: "Database operation failed",
  },
  FILE_SYSTEM_ERROR: {
    code: "SYSTEM_FILE_SYSTEM_ERROR",
    status: 500,
    statusCode: 500,
    message: "File system error occurred",
  },
  CONFIG_ERROR: {
    code: "SYSTEM_CONFIG_ERROR",
    status: 500,
    statusCode: 500,
    message: "System configuration issue",
  },
  NETWORK_ERROR: {
    code: "SYSTEM_NETWORK_ERROR",
    status: 503,
    statusCode: 503,
    message: "Network connection failed",
  },
};

// AUTHENTICATION & AUTHORIZATION ERRORS
const AUTH_ERRORS = {
  INVALID_CREDENTIALS: {
    code: "AUTH_INVALID_CREDENTIALS",
    status: 401,
    statusCode: 401,
    message: "Invalid credentials",
  },
  USER_INACTIVE: {
    code: "AUTH_USER_INACTIVE",
    status: 403,
    statusCode: 403,
    message: "User inactive",
  },
  INCORRECT_PASSWORD: {
    code: "AUTH_INCORRECT_PASSWORD",
    status: 401,
    statusCode: 401,
    message: "Incorrect password",
  },
  EMAIL_EXISTS: {
    code: "AUTH_EMAIL_EXISTS",
    status: 400,
    statusCode: 400,
    message: "Email already exists",
  },
  TOKEN_EXPIRED: {
    code: "AUTH_TOKEN_EXPIRED",
    status: 401,
    statusCode: 401,
    message: "Authentication token expired",
  },
  UNAUTHORIZED_ACCESS: {
    code: "AUTH_UNAUTHORIZED_ACCESS",
    status: 403,
    statusCode: 403,
    message: "You are not authorized to access this resource",
  },
};

// USER & ADMIN ERRORS
const USER_ERRORS = {
  NOT_FOUND: {
    code: "USER_NOT_FOUND",
    status: 404,
    statusCode: 404,
    message: "User not found",
  },
  CREATION_FAILED: {
    code: "USER_CREATION_FAILED",
    status: 500,
    statusCode: 500,
    message: "Failed to create user",
  },
  UPDATE_FAILED: {
    code: "USER_UPDATE_FAILED",
    status: 500,
    statusCode: 500,
    message: "Failed to update user",
  },
  DELETION_FAILED: {
    code: "USER_DELETION_FAILED",
    status: 500,
    statusCode: 500,
    message: "Failed to delete user",
  },
};

// BRANCH / ORGANIZATION ERRORS
const BRANCH_ERRORS = {
  NOT_FOUND: {
    code: "BRANCH_NOT_FOUND",
    status: 404,
    statusCode: 404,
    message: "Branch not found",
  },
  CREATION_FAILED: {
    code: "BRANCH_CREATION_FAILED",
    status: 500,
    statusCode: 500,
    message: "Failed to create branch",
  },
  UPDATE_FAILED: {
    code: "BRANCH_UPDATE_FAILED",
    status: 500,
    statusCode: 500,
    message: "Failed to update branch",
  },
  DELETION_FAILED: {
    code: "BRANCH_DELETION_FAILED",
    status: 500,
    statusCode: 500,
    message: "Failed to delete branch",
  },
};

// EXPORT STRUCTURED ERROR COLLECTION
const ERROR_MESSAGES = {
  SYSTEM: SYSTEM_ERRORS,
  AUTH: AUTH_ERRORS,
  USER: USER_ERRORS,
  BRANCH: BRANCH_ERRORS,
};

export default ERROR_MESSAGES;
