import { vi } from 'vitest';

/**
 * Global Test Setup
 * 
 * This file runs before all tests and sets up global mocks.
 * All Prisma database operations are mocked to avoid using a real database.
 */

// Mock Prisma Client
vi.mock('../src/utils/prisma.js', () => {
  // Create mock Prisma methods
  const mockPrismaClient = {
    member: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    librarian: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    adminUser: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    book: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    bookCopy: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    borrowing: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    reservation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
  };

  return {
    default: mockPrismaClient,
  };
});

// Mock bcrypt to avoid actual password hashing in tests
vi.mock('../src/utils/bcrypt.js', () => ({
  hashPassword: vi.fn((password) => Promise.resolve(`hashed_${password}`)),
  comparePassword: vi.fn((password, hash) => 
    Promise.resolve(hash === `hashed_${password}`)
  ),
}));

// Mock JWT to avoid actual token generation in tests
vi.mock('../src/utils/jwt.js', () => ({
  generateToken: vi.fn((payload) => `mock_jwt_token_${payload.id}`),
  verifyToken: vi.fn((token) => {
    if (token === 'valid_token') {
      return { id: 'user-id-123', email: 'test@test.com', role: 'MEMBER' };
    }
    if (token === 'admin_token') {
      return { id: 'admin-id-123', email: 'admin@test.com', role: 'ADMIN' };
    }
    if (token === 'librarian_token') {
      return { id: 'librarian-id-123', email: 'librarian@test.com', role: 'LIBRARIAN' };
    }
    throw new Error('Invalid token');
  }),
}));

// Mock auth middleware to bypass authentication in tests
vi.mock('../src/middlewares/auth.js', () => ({
  authenticate: (req, res, next) => {
    // If req.user is already set by test, use it
    // Otherwise, allow request to pass (auth routes don't need it)
    if (!req.user) {
      // Try to extract from Authorization header if present
      const authHeader = req.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Set a default user for admin routes
        req.user = {
          id: 'test-user-id',
          email: 'test@test.com',
          role: 'ADMIN',
        };
      }
    }
    next();
  },
  authorize: (...roles) => {
    return (req, res, next) => {
      // If req.user is already set, check role
      if (req.user) {
        // Allow if role matches or if no specific role required
        if (roles.length === 0 || roles.includes(req.user.role)) {
          return next();
        }
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      // If no user set, check if this is a public route
      // For now, allow it (tests will set req.user explicitly)
      next();
    };
  },
  verifyUserActive: async (req, res, next) => {
    // Skip user verification - assume active if req.user exists
    if (req.user) {
      req.userData = { isActive: true };
    }
    next();
  },
}));

// Suppress console logs during tests (optional)
// console.log = vi.fn();
// console.error = vi.fn();

