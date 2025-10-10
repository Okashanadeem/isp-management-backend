import express from 'express';
import {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  suspendService,
  activateService
} from '../controllers/customerController.js';
import { validateCustomer } from '../validators/customerValidator.js';
import validate from '../middlewares/validateMiddleware.js'; // ✅ IMPORTED middleware wrapper

const router = express.Router();

// ✅ GET /customers - list all customers
router.get('/', listCustomers);

// ✅ POST /customers - create new customer (Joi schema wrapped in middleware)
router.post('/', validate(validateCustomer), createCustomer);

// ✅ GET /customers/:id - get customer by ID
router.get('/:id', getCustomerById);

// ✅ PUT /customers/:id - update existing customer (Joi schema wrapped in middleware)
router.put('/:id', validate(validateCustomer), updateCustomer);

// ✅ POST /customers/:id/suspend - suspend service
router.post('/:id/suspend', suspendService);

// ✅ POST /customers/:id/activate - activate service
router.post('/:id/activate', activateService);

export default router;
