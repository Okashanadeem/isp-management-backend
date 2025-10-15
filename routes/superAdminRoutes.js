import express from "express";
import {
  getDashboard,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  createBranchAdmin,
  getAnalytics,
  getAllTickets,
  getTicketDetailsById,
  updateTicketStatus,
  getTicketStats,
  getCustomerAnalytics,
  getBandwidthAnalytics,
  getPerformanceAnalytics,
  getRevenueAnalytics,
} from "../controllers/superAdminController.js";

import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();


// Dashboard analytics
router.get("/dashboard", protect, authorizeRoles("superadmin"), getDashboard);

// System analytics
router.get("/analytics", protect, authorizeRoles("superadmin"), getAnalytics);

// Branch management
router.get("/branches", protect, authorizeRoles("superadmin"), getBranches);
router.post("/branches", protect, authorizeRoles("superadmin"), createBranch);
router.put("/branches/:id", protect, authorizeRoles("superadmin"), updateBranch);
router.delete("/branches/:id", protect, authorizeRoles("superadmin"), deleteBranch);

// Admin assignment system
router.post("/admins", protect, authorizeRoles("superadmin"), createBranchAdmin);


// Get ticket statistics (must be before /:id route)
router.get(
  "/tickets/stats/overview",
  protect,
  authorizeRoles("superadmin"),
  getTicketStats
);

// Get all tickets across all branches
router.get(
  "/tickets",
  protect,
  authorizeRoles("superadmin"),
  getAllTickets
);

// Get specific ticket details
router.get(
  "/tickets/:id",
  protect,
  authorizeRoles("superadmin"),
  getTicketDetailsById
);

// Update ticket status
router.put(
  "/tickets/:id/status",
  protect,
  authorizeRoles("superadmin"),
  updateTicketStatus
);

// Analytics routes
router.get(
  "/analytics/customers",
  protect,
  authorizeRoles("superadmin"),
  getCustomerAnalytics
);

router.get(
  "/analytics/bandwidth",
  protect,
  authorizeRoles("superadmin"),
  getBandwidthAnalytics
);

router.get(
  "/analytics/performance",
  protect,
  authorizeRoles("superadmin"),
  getPerformanceAnalytics
);

router.get(
  "/analytics/revenue",
  protect,
  authorizeRoles("superadmin"),
  getRevenueAnalytics
);

export default router;