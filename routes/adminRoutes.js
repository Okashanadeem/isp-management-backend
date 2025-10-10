import express from 'express';
import {
  getDashboard,
  listCustomers,
  addCustomer,
  updateCustomer,
  uploadDocuments
} from '../controllers/admin.controller.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Branch dashboard
router.get('/dashboard', getDashboard);

// List customers (with pagination & search)
router.get('/customers', listCustomers);

// Add new customer
router.post('/customers', addCustomer);

// Update customer by ID
router.put('/customers/:id', updateCustomer);

// Upload documents for a specific customer
router.post('/customers/:id/documents', upload.array('documents', 5), uploadDocuments);

export default router;
