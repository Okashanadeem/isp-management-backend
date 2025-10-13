import express from "express";
import {
  getDashboard,
  listCustomers,
  addCustomer,
  updateCustomer,
  uploadDocuments,
  createTicket,
  getMyTickets,
  getTicketById,
} from "../controllers/adminController.js";

import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import { getExpiringSubscriptions, getExpiredSubscriptions } from '../controllers/adminController.js';

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("admin"), getDashboard);

router.get("/customers", protect, authorizeRoles("admin"), listCustomers);

router.post("/customers", protect, authorizeRoles("admin"), addCustomer);

router.put("/customers/:id", protect, authorizeRoles("admin"), updateCustomer);

// Upload documents for a specific customer
router.post(
  "/customers/:id/documents",
  protect,
  authorizeRoles("admin"),
  upload.array("documents", 5),
  uploadDocuments
);


// Create new ticket
router.post(
  "/tickets",
  protect,
  authorizeRoles("admin"),
  createTicket
);

// Get all tickets for the branch admin's branch
router.get(
  "/tickets",
  protect,
  authorizeRoles("admin"),
  getMyTickets
);

// Get specific ticket by ID (only from their branch)
router.get(
  "/tickets/:id",
  protect,
  authorizeRoles("admin"),
  getTicketById
);

export default router;

router.get('/subscriptions/expiring', getExpiringSubscriptions);

router.get('/subscriptions/expired', getExpiredSubscriptions);