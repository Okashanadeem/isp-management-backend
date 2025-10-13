import express from 'express';
import {
  getDashboard,
  listCustomers,
  addCustomer,
  updateCustomer,
  uploadDocuments
} from '../controllers/adminController.js';
import upload from '../middlewares/uploadMiddleware.js';
import { getExpiringSubscriptions, getExpiredSubscriptions } from '../controllers/adminController.js';

const router = express.Router();
router.get('/dashboard', getDashboard);

router.get('/customers', listCustomers);

router.post('/customers', addCustomer);

router.put('/customers/:id', updateCustomer);

router.post('/customers/:id/documents', upload.array('documents', 5), uploadDocuments);

router.get('/subscriptions/expiring', getExpiringSubscriptions);

router.get('/subscriptions/expired', getExpiredSubscriptions);

export default router;
