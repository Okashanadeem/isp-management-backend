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
import validate from '../middlewares/validateMiddleware.js'; 

const router = express.Router();

router.get('/', listCustomers);

router.post('/', validate(validateCustomer), createCustomer);

router.get('/:id', getCustomerById);

router.put('/:id', validate(validateCustomer), updateCustomer);

router.post('/:id/suspend', suspendService);

router.post('/:id/activate', activateService);

export default router;
