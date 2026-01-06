import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import prisma from '../src/utils/prisma.js';
import { resetPrismaMocks } from './helpers.js';

// Import routes
import authRoutes from '../src/routes/authRoutes.js';
import adminRoutes from '../src/routes/adminRoutes.js';

dotenv.config();

/**
 * Mock authentication middleware for admin routes
 */
const mockAuthMiddleware = (role = 'ADMIN', userId = 'admin-id-123') => {
  return (req, res, next) => {
    req.user = {
      id: userId,
      email: `${role.toLowerCase()}@test.com`,
      role: role,
    };
    next();
  };
};

/**
 * User Management API Unit Tests
 * 
 * Tests for user-related endpoints including:
 * - Authentication (login, register)
 * - User creation (members, librarians, admins)
 * - User retrieval
 * - User validation
 * 
 * All database operations are mocked using vi.mock()
 */
describe('User Routes (/api/auth and /api/admin/users)', () => {
  let app;
  
  beforeEach(() => {
    // Reset all Prisma mocks before each test
    resetPrismaMocks(prisma);
    
    // Mock verifyUserActive to always return active user
    prisma.adminUser.findUnique = vi.fn().mockResolvedValue({
      id: 'admin-id-123',
      email: 'admin@test.com',
      isActive: true,
    });
    prisma.member.findUnique = vi.fn().mockResolvedValue({
      id: 'member-id-123',
      email: 'member@test.com',
      isActive: true,
    });
    
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    
    // Admin routes - middleware will use mocked authenticate/authorize from setup.js
    // But we need to set req.user before middleware runs
    app.use('/api/admin', (req, res, next) => {
      // Set user for admin routes (mock auth middleware will use this)
      req.user = {
        id: 'admin-id-123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      next();
    });
    app.use('/api/admin', adminRoutes);
  });

  // ==================== AUTHENTICATION TESTS ====================

  describe('POST /api/auth/register', () => {
    it('should create a new member successfully', async () => {
      // Arrange
      const newMember = {
        email: 'newmember@test.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        address: '123 Main St',
      };

      // Mock Prisma: email doesn't exist
      prisma.member.findUnique.mockResolvedValue(null);
      
      // Mock Prisma: create member
      const createdMember = {
        id: 'member-id-123',
        ...newMember,
        password: 'hashed_password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.member.create.mockResolvedValue(createdMember);

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(newMember)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('message', 'Member registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(newMember.email);
      expect(response.body.user.firstName).toBe(newMember.firstName);
      expect(response.body.user).not.toHaveProperty('password');
      expect(prisma.member.findUnique).toHaveBeenCalledWith({
        where: { email: newMember.email },
      });
      expect(prisma.member.create).toHaveBeenCalled();
    });

    it('should return validation error for missing required fields', async () => {
      // Arrange
      const invalidMember = {
        email: 'test@test.com',
        // Missing password, firstName, lastName
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidMember)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
      expect(prisma.member.findUnique).not.toHaveBeenCalled();
      expect(prisma.member.create).not.toHaveBeenCalled();
    });

    it('should return error if email already exists', async () => {
      // Arrange
      const existingMember = {
        email: 'existing@test.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      // Mock Prisma: email already exists
      prisma.member.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@test.com',
      });

      // Act & Assert
      const response = await request(app)
        .post('/api/auth/register')
        .send(existingMember)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already registered');
      expect(prisma.member.findUnique).toHaveBeenCalledWith({
        where: { email: existingMember.email },
      });
      expect(prisma.member.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'member@test.com',
        password: 'password123',
        role: 'MEMBER',
      };

      // Mock Prisma: member exists
      const member = {
        id: 'member-id-123',
        email: loginData.email,
        password: 'hashed_password123',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
      };
      prisma.member.findUnique.mockResolvedValue(member);

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user).not.toHaveProperty('password');
      expect(prisma.member.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
    });

    it('should return error for missing credentials', async () => {
      // Arrange
      const invalidLogin = {
        email: 'test@test.com',
        // Missing password and role
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidLogin)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should return error for invalid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'member@test.com',
        password: 'wrongpassword',
        role: 'MEMBER',
      };

      // Mock Prisma: member exists but password is wrong
      const member = {
        id: 'member-id-123',
        email: loginData.email,
        password: 'hashed_password123',
        isActive: true,
      };
      prisma.member.findUnique.mockResolvedValue(member);

      // Act & Assert
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });
  });

  // ==================== ADMIN USER MANAGEMENT TESTS ====================

  describe('POST /api/admin/members', () => {
    it('should create a new member successfully', async () => {
      // Arrange
      const newMember = {
        email: 'admincreated@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Created',
        phone: '555-1234',
        address: '456 Admin St',
      };

      // Mock Prisma: email doesn't exist
      prisma.member.findUnique.mockResolvedValue(null);
      
      // Mock Prisma: create member
      const createdMember = {
        id: 'new-member-id',
        ...newMember,
        password: 'hashed_password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.member.create.mockResolvedValue(createdMember);

      // Act
      const response = await request(app)
        .post('/api/admin/members')
        .send(newMember)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('message', 'Member created successfully');
      expect(response.body).toHaveProperty('member');
      expect(response.body.member.email).toBe(newMember.email);
      expect(response.body.member).not.toHaveProperty('password');
      expect(prisma.member.findUnique).toHaveBeenCalled();
      expect(prisma.member.create).toHaveBeenCalled();
    });

    it('should return validation error for missing required fields', async () => {
      // Arrange
      const invalidMember = {
        email: 'test@test.com',
        // Missing required fields
      };

      // Act & Assert
      const response = await request(app)
        .post('/api/admin/members')
        .send(invalidMember)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(prisma.member.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/admin/members', () => {
    it('should get all members successfully', async () => {
      // Arrange
      const mockMembers = [
        {
          id: 'member-1',
          email: 'member1@test.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
        },
        {
          id: 'member-2',
          email: 'member2@test.com',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
        },
      ];

      prisma.member.findMany.mockResolvedValue(mockMembers);

      // Act
      const response = await request(app)
        .get('/api/admin/members')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('email');
      expect(prisma.member.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no members exist', async () => {
      // Arrange
      prisma.member.findMany.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/api/admin/members')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /api/admin/librarians', () => {
    it('should create a new librarian successfully', async () => {
      // Arrange
      const newLibrarian = {
        email: 'librarian@test.com',
        password: 'password123',
        firstName: 'Librarian',
        lastName: 'User',
        phone: '555-5678',
      };

      prisma.librarian.findUnique.mockResolvedValue(null);
      const createdLibrarian = {
        id: 'librarian-id-123',
        ...newLibrarian,
        password: 'hashed_password123',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.librarian.create.mockResolvedValue(createdLibrarian);

      // Act
      const response = await request(app)
        .post('/api/admin/librarians')
        .send(newLibrarian)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('message', 'Librarian created successfully');
      expect(response.body).toHaveProperty('librarian');
      expect(response.body.librarian.email).toBe(newLibrarian.email);
      expect(response.body.librarian).not.toHaveProperty('password');
      expect(prisma.librarian.create).toHaveBeenCalled();
    });

    it('should return error if librarian email already exists', async () => {
      // Arrange
      const existingLibrarian = {
        email: 'existing@test.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'Librarian',
      };

      prisma.librarian.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@test.com',
      });

      // Act & Assert
      const response = await request(app)
        .post('/api/admin/librarians')
        .send(existingLibrarian)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already registered');
      expect(prisma.librarian.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/admin/librarians', () => {
    it('should get all librarians successfully', async () => {
      // Arrange
      const mockLibrarians = [
        {
          id: 'librarian-1',
          email: 'librarian1@test.com',
          firstName: 'Librarian',
          lastName: 'One',
          isActive: true,
        },
      ];

      prisma.librarian.findMany.mockResolvedValue(mockLibrarians);

      // Act
      const response = await request(app)
        .get('/api/admin/librarians')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('email', 'librarian1@test.com');
      expect(prisma.librarian.findMany).toHaveBeenCalled();
    });
  });
});

