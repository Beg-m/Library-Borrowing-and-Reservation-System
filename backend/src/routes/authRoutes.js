import express from 'express';
import { loginController, registerController } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', loginController);

// POST /api/auth/register
router.post('/register', registerController);

export default router;

