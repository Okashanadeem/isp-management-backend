import { Router } from 'express';
const router = Router();
import { login, logout, getProfile } from '../controllers/authController.js';
import validate from '../middlewares/validateMiddleware.js';
import { loginValidator } from '../validators/authValidator.js';
import { protect } from '../middlewares/authMiddleware.js';

// Login route with validation
router.post('/login', validate(loginValidator), login);

// Logout route (protected)
router.post('/logout', protect, logout);

// Profile route (protected)
router.get('/profile', protect, getProfile);

export default router;
