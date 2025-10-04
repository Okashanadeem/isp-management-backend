import { Router } from 'express';
const router = Router();
import { login, logout } from '../controllers/authController.js';
import validate from '../middlewares/validateMiddleware.js';
import { loginValidator } from '../validators/authValidator.js';
import { protect } from '../middlewares/authMiddleware.js';


router.post('/login', validate(loginValidator), login);
router.post('/logout', protect, logout);  

export default router;
