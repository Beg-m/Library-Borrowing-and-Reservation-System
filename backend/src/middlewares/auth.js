import { verifyToken } from '../utils/jwt.js';
import prisma from '../utils/prisma.js';

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has required role
 * @param {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Middleware to verify user exists and is active
 */
export const verifyUserActive = async (req, res, next) => {
  try {
    const { role, id } = req.user;

    let user;
    if (role === 'MEMBER') {
      user = await prisma.member.findUnique({ where: { id } });
    } else if (role === 'LIBRARIAN') {
      user = await prisma.librarian.findUnique({ where: { id } });
    } else if (role === 'ADMIN') {
      user = await prisma.adminUser.findUnique({ where: { id } });
    }

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account is inactive or not found' });
    }

    req.userData = user;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Error verifying user' });
  }
};

