import { login, registerMember } from '../services/authService.js';

/**
 * Login controller
 * POST /api/auth/login
 */
export const loginController = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const result = await login(email, password, role);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * Register member controller
 * POST /api/auth/register
 */
export const registerController = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
    }

    const result = await registerMember({ email, password, firstName, lastName, phone, address });
    res.status(201).json({ 
      message: 'Member registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

