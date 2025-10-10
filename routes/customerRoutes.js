import express from 'express';
import {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  suspendService,
  activateService
} from '../controllers/customer.controller.js';
import { validateCustomer } from '../middleware/customerAuth.middleware.js';

const router = express.Router();

// GET /customers
router.get('/', listCustomers);

// POST /customers
router.post('/', createCustomer);

// GET /customers
router.get('/:id', validateCustomer, getCustomerById);

// PUT /customers
router.put('/:id', validateCustomer, updateCustomer);

// POST /customers suspend
router.post('/:id/suspend', validateCustomer, suspendService);

// POST /customers activate
router.post('/:id/activate', validateCustomer, activateService);

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: ' invalid file type.' });
  }
  res.json({
    message: 'file uploaded successfully',
    filename: req.file.filename,
  });
});

app.listen(3000, () => console.log('✅ Server started on port 5000'));
export default router;

