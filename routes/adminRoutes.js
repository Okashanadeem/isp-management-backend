import express from "express";
import {
  getDashboard,
  listCustomers,
  getCustomerById,
  createTicket,
  getMyTickets,
  getTicketById,
  getExpiringSubscriptions,
  getExpiredSubscriptions,
  getBranchCustomerAnalytics,
  getBranchBandwidthAnalytics,
  getBranchPerformanceAnalytics,
  getBranchSubscriptionAnalytics,
} from "../controllers/adminController.js";

import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getDashboard);

router.get("/customers", protect, authorizeRoles("admin"), listCustomers);
router.get("/customers/:id", protect, authorizeRoles("admin"), getCustomerById);
router.post("/customers", protect, authorizeRoles("admin"), addCustomer);

// router.put(
//   "/customers/:id",
//   protect,
//   authorizeRoles("admin"),
//   upload.array("documents", 5),  
//   updateCustomer
// );

router.post("/tickets", protect, authorizeRoles("admin"), createTicket);
router.get("/tickets", protect, authorizeRoles("admin"), getMyTickets);
router.get("/tickets/:id", protect, authorizeRoles("admin"), getTicketById);

router.get("/subscriptions/expiring", protect, authorizeRoles("admin"), getExpiringSubscriptions);
router.get("/subscriptions/expired", protect, authorizeRoles("admin"), getExpiredSubscriptions);

export default router;
// Analytics routes
router.get(
  "/analytics/customers",
  protect,
  authorizeRoles("admin"),
  getBranchCustomerAnalytics
);

router.get(
  "/analytics/bandwidth",
  protect,
  authorizeRoles("admin"),
  getBranchBandwidthAnalytics
);

router.get(
  "/analytics/performance",
  protect,
  authorizeRoles("admin"),
  getBranchPerformanceAnalytics
);

router.get(
  "/analytics/subscriptions",
  protect,
  authorizeRoles("admin"),
  getBranchSubscriptionAnalytics
);

export default router;
