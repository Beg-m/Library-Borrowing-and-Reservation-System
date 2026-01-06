import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

/**
 * Test Helper Utilities
 * 
 * Provides helper functions for creating test app instances
 * and mocking authentication middleware.
 */

dotenv.config();

/**
 * Create a test Express app with routes but without authentication
 * Used for testing routes that bypass auth (like auth routes)
 */
export function createTestApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  return app;
}

/**
 * Create a test Express app with mocked authentication
 * Sets req.user based on the provided role
 */
export function createAuthenticatedApp(role = 'MEMBER', userId = 'user-id-123') {
  const app = createTestApp();
  
  // Mock authentication middleware
  app.use((req, res, next) => {
    req.user = {
      id: userId,
      email: `${role.toLowerCase()}@test.com`,
      role: role,
    };
    next();
  });
  
  return app;
}

/**
 * Mock request headers for authentication
 */
export function getAuthHeaders(token = 'valid_token') {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Reset all Prisma mocks
 */
export function resetPrismaMocks(prisma) {
  Object.keys(prisma).forEach((model) => {
    Object.keys(prisma[model]).forEach((method) => {
      if (typeof prisma[model][method].mockReset === 'function') {
        prisma[model][method].mockReset();
      }
    });
  });
}

