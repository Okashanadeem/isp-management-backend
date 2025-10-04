import express from "express";
import {
  getDashboard,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  createBranchAdmin,
  getAnalytics,
} from "../controllers/superAdminController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Dashboard analytics
router.get("/dashboard", protect, authorizeRoles("superadmin"), getDashboard);

// Branch management
router.get("/branches", protect, authorizeRoles("superadmin"), getBranches);
router.post("/branches", protect, authorizeRoles("superadmin"), createBranch);
router.put("/branches/:id", protect, authorizeRoles("superadmin"), updateBranch);
router.delete("/branches/:id", protect, authorizeRoles("superadmin"), deleteBranch);

// Admin assignment system
router.post("/admins", protect, authorizeRoles("superadmin"), createBranchAdmin);

// System analytics
router.get("/analytics", protect, authorizeRoles("superadmin"), getAnalytics);

export default router;
