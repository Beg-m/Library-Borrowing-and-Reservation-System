import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import prisma from '../src/utils/prisma.js';
import { resetPrismaMocks } from './helpers.js';

// Import routes
import memberRoutes from '../src/routes/memberRoutes.js';
import librarianRoutes from '../src/routes/librarianRoutes.js';

dotenv.config();

/**
 * Mock authentication middleware for member routes
 */
const mockMemberAuth = () => {
  return (req, res, next) => {
    req.user = {
      id: 'member-id-123',
      email: 'member@test.com',
      role: 'MEMBER',
    };
    next();
  };
};

/**
 * Mock authentication middleware for librarian routes
 */
const mockLibrarianAuth = () => {
  return (req, res, next) => {
    req.user = {
      id: 'librarian-id-123',
      email: 'librarian@test.com',
      role: 'LIBRARIAN',
    };
    next();
  };
};

/**
 * Borrowing Management API Unit Tests
 * 
 * Tests for borrowing-related endpoints including:
 * - Create borrowing request
 * - Approve/reject borrowing
 * - Get active borrowings
 * - Handle unavailable book errors
 * - Return books
 * 
 * All database operations are mocked using vi.mock()
 */
describe('Borrowing Routes (/api/members/borrowings and /api/librarians/borrowings)', () => {
  let memberApp;
  let librarianApp;
  
  beforeEach(() => {
    // Reset all Prisma mocks before each test
    resetPrismaMocks(prisma);
    
    // Mock verifyUserActive for member
    prisma.member.findUnique = vi.fn().mockResolvedValue({
      id: 'member-id-123',
      email: 'member@test.com',
      isActive: true,
    });
    
    // Mock verifyUserActive for librarian
    prisma.librarian.findUnique = vi.fn().mockResolvedValue({
      id: 'librarian-id-123',
      email: 'librarian@test.com',
      isActive: true,
    });
    
    // Create member app
    memberApp = express();
    memberApp.use(express.json());
    // Set req.user before routes (mock middleware will use it)
    memberApp.use('/api/members', (req, res, next) => {
      req.user = {
        id: 'member-id-123',
        email: 'member@test.com',
        role: 'MEMBER',
      };
      next();
    });
    memberApp.use('/api/members', memberRoutes);
    
    // Create librarian app
    librarianApp = express();
    librarianApp.use(express.json());
    // Set req.user before routes (mock middleware will use it)
    librarianApp.use('/api/librarians', (req, res, next) => {
      req.user = {
        id: 'librarian-id-123',
        email: 'librarian@test.com',
        role: 'LIBRARIAN',
      };
      next();
    });
    librarianApp.use('/api/librarians', librarianRoutes);
  });

  // ==================== CREATE BORROWING REQUEST TESTS ====================

  describe('POST /api/members/borrowings', () => {
    it('should create borrowing request successfully', async () => {
      // Arrange
      const bookCopyId = 'copy-id-123';
      const memberId = 'member-id-123';
      
      const mockBookCopy = {
        id: bookCopyId,
        copyNumber: 1,
        status: 'AVAILABLE',
        book: {
          id: 'book-id-123',
          title: 'Test Book',
          author: 'Test Author',
        },
      };

      // Mock book copy exists and is available
      prisma.bookCopy.findUnique = vi.fn().mockResolvedValue(mockBookCopy);
      
      // Mock no existing borrowing
      prisma.borrowing.findFirst = vi.fn().mockResolvedValue(null);
      
      // Mock borrowing creation
      const createdBorrowing = {
        id: 'borrowing-id-123',
        memberId,
        bookCopyId,
        status: 'PENDING',
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        bookCopy: {
          ...mockBookCopy,
          book: mockBookCopy.book,
        },
      };
      prisma.borrowing.create = vi.fn().mockResolvedValue(createdBorrowing);
      
      // Mock book copy update
      prisma.bookCopy.update = vi.fn().mockResolvedValue({
        ...mockBookCopy,
        status: 'RESERVED',
      });

      // Act
      const response = await request(memberApp)
        .post('/api/members/borrowings')
        .send({ bookCopyId })
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body.bookCopy).toBeDefined();
      expect(prisma.bookCopy.findUnique).toHaveBeenCalledWith({
        where: { id: bookCopyId },
        include: { book: true },
      });
      expect(prisma.borrowing.create).toHaveBeenCalled();
      expect(prisma.bookCopy.update).toHaveBeenCalledWith({
        where: { id: bookCopyId },
        data: { status: 'RESERVED' },
      });
    });

    it('should return validation error for missing bookCopyId', async () => {
      // Arrange
      const invalidRequest = {};
      // Missing bookCopyId

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/borrowings')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
      expect(prisma.borrowing.create).not.toHaveBeenCalled();
    });

    it('should return error when book copy not found', async () => {
      // Arrange
      const bookCopyId = 'non-existent-copy';
      
      prisma.bookCopy.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/borrowings')
        .send({ bookCopyId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
      expect(prisma.borrowing.create).not.toHaveBeenCalled();
    });

    it('should return error when book copy is not available', async () => {
      // Arrange
      const bookCopyId = 'copy-id-123';
      const unavailableCopy = {
        id: bookCopyId,
        status: 'BORROWED', // Not available
        book: { id: 'book-id-123', title: 'Test Book' },
      };

      prisma.bookCopy.findUnique = vi.fn().mockResolvedValue(unavailableCopy);

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/borrowings')
        .send({ bookCopyId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not available');
      expect(prisma.borrowing.create).not.toHaveBeenCalled();
    });

    it('should return error when member already has active borrowing for this copy', async () => {
      // Arrange
      const bookCopyId = 'copy-id-123';
      const availableCopy = {
        id: bookCopyId,
        status: 'AVAILABLE',
        book: { id: 'book-id-123', title: 'Test Book' },
      };

      prisma.bookCopy.findUnique = vi.fn().mockResolvedValue(availableCopy);
      
      // Mock existing borrowing
      prisma.borrowing.findFirst = vi.fn().mockResolvedValue({
        id: 'existing-borrowing-id',
        status: 'APPROVED',
      });

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/borrowings')
        .send({ bookCopyId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already');
      expect(prisma.borrowing.create).not.toHaveBeenCalled();
    });
  });

  // ==================== GET ACTIVE BORROWINGS TESTS ====================

  describe('GET /api/members/borrowings/active', () => {
    it('should get active borrowings successfully', async () => {
      // Arrange
      const memberId = 'member-id-123';
      const mockBorrowings = [
        {
          id: 'borrowing-1',
          memberId,
          status: 'APPROVED',
          borrowDate: new Date(),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          bookCopy: {
            id: 'copy-1',
            copyNumber: 1,
            book: {
              id: 'book-1',
              title: 'Book One',
              author: 'Author One',
            },
          },
        },
        {
          id: 'borrowing-2',
          memberId,
          status: 'APPROVED',
          borrowDate: new Date(),
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue
          bookCopy: {
            id: 'copy-2',
            copyNumber: 2,
            book: {
              id: 'book-2',
              title: 'Book Two',
              author: 'Author Two',
            },
          },
        },
      ];

      prisma.borrowing.findMany = vi.fn().mockResolvedValue(mockBorrowings);

      // Act
      const response = await request(memberApp)
        .get('/api/members/borrowings/active')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('bookCopy');
      expect(prisma.borrowing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            memberId,
            status: expect.objectContaining({
              in: expect.arrayContaining(['PENDING', 'APPROVED']),
            }),
          }),
        })
      );
    });

    it('should return empty array when no active borrowings', async () => {
      // Arrange
      prisma.borrowing.findMany = vi.fn().mockResolvedValue([]);

      // Act
      const response = await request(memberApp)
        .get('/api/members/borrowings/active')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });

  // ==================== APPROVE BORROWING TESTS ====================

  describe('PATCH /api/librarians/borrowings/:borrowingId/approve', () => {
    it('should approve borrowing request successfully', async () => {
      // Arrange
      const borrowingId = 'borrowing-id-123';
      const mockBorrowing = {
        id: borrowingId,
        status: 'PENDING',
        bookCopyId: 'copy-id-123',
        memberId: 'member-id-123',
        borrowDate: new Date(),
        dueDate: new Date(),
        bookCopy: {
          id: 'copy-id-123',
          status: 'RESERVED', // Must be RESERVED for approval
        },
      };

      prisma.borrowing.findUnique = vi.fn().mockResolvedValue(mockBorrowing);
      prisma.borrowing.update = vi.fn().mockResolvedValue({
        ...mockBorrowing,
        status: 'APPROVED',
        member: { id: 'member-1', email: 'test@test.com', firstName: 'John', lastName: 'Doe' },
        bookCopy: {
          id: 'copy-id-123',
          book: { id: 'book-1', title: 'Test Book', category: { id: 'cat-1', name: 'Fiction' } },
        },
      });
      prisma.bookCopy.update = vi.fn().mockResolvedValue({
        id: 'copy-id-123',
        status: 'BORROWED',
      });

      // Act
      const response = await request(librarianApp)
        .patch(`/api/librarians/borrowings/${borrowingId}/approve`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('approved');
      expect(response.body).toHaveProperty('borrowing');
      expect(prisma.borrowing.update).toHaveBeenCalled();
      expect(prisma.bookCopy.update).toHaveBeenCalled();
    });

    it('should return error when borrowing not found', async () => {
      // Arrange
      const borrowingId = 'non-existent-id';
      prisma.borrowing.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(librarianApp)
        .patch(`/api/librarians/borrowings/${borrowingId}/approve`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(prisma.borrowing.update).not.toHaveBeenCalled();
    });
  });

  // ==================== REJECT BORROWING TESTS ====================

  describe('PATCH /api/librarians/borrowings/:borrowingId/reject', () => {
    it('should reject borrowing request successfully', async () => {
      // Arrange
      const borrowingId = 'borrowing-id-123';
      const mockBorrowing = {
        id: borrowingId,
        status: 'PENDING',
        bookCopyId: 'copy-id-123',
      };

      prisma.borrowing.findUnique = vi.fn().mockResolvedValue(mockBorrowing);
      prisma.borrowing.update = vi.fn().mockResolvedValue({
        ...mockBorrowing,
        status: 'REJECTED',
        member: { id: 'member-1', email: 'test@test.com', firstName: 'John', lastName: 'Doe' },
        bookCopy: {
          id: 'copy-id-123',
          book: { id: 'book-1', title: 'Test Book' },
        },
      });
      prisma.bookCopy.update = vi.fn().mockResolvedValue({
        id: 'copy-id-123',
        status: 'AVAILABLE',
      });

      // Act
      const response = await request(librarianApp)
        .patch(`/api/librarians/borrowings/${borrowingId}/reject`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('rejected');
      expect(prisma.borrowing.update).toHaveBeenCalled();
      expect(prisma.bookCopy.update).toHaveBeenCalled();
    });
  });

  // ==================== GET PENDING BORROWINGS TESTS ====================

  describe('GET /api/librarians/borrowings/pending', () => {
    it('should get pending borrowings successfully', async () => {
      // Arrange
      const mockPendingBorrowings = [
        {
          id: 'borrowing-1',
          status: 'PENDING',
          borrowDate: new Date(),
          member: {
            id: 'member-1',
            email: 'member1@test.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          bookCopy: {
            id: 'copy-1',
            copyNumber: 1,
            book: {
              id: 'book-1',
              title: 'Test Book',
              author: 'Test Author',
            },
          },
        },
      ];

      prisma.borrowing.findMany = vi.fn().mockResolvedValue(mockPendingBorrowings);

      // Act
      const response = await request(librarianApp)
        .get('/api/librarians/borrowings/pending')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('status', 'PENDING');
      expect(response.body[0]).toHaveProperty('member');
      expect(prisma.borrowing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        })
      );
    });
  });

  // ==================== RETURN BOOK TESTS ====================

  describe('PATCH /api/librarians/borrowings/:borrowingId/return', () => {
    it('should return book successfully', async () => {
      // Arrange
      const borrowingId = 'borrowing-id-123';
      const mockBorrowing = {
        id: borrowingId,
        status: 'APPROVED', // Must be APPROVED for return
        bookCopyId: 'copy-id-123',
        returnDate: null,
        bookCopy: {
          id: 'copy-id-123',
          status: 'BORROWED',
        },
      };

      prisma.borrowing.findUnique = vi.fn().mockResolvedValue({
        ...mockBorrowing,
        include: { bookCopy: true },
      });
      prisma.borrowing.update = vi.fn().mockResolvedValue({
        ...mockBorrowing,
        status: 'RETURNED',
        returnDate: new Date(),
        member: { id: 'member-1', email: 'test@test.com', firstName: 'John', lastName: 'Doe' },
        bookCopy: {
          id: 'copy-id-123',
          book: { id: 'book-1', title: 'Test Book', category: { id: 'cat-1', name: 'Fiction' } },
        },
      });
      prisma.bookCopy.update = vi.fn().mockResolvedValue({
        id: 'copy-id-123',
        status: 'AVAILABLE',
      });

      // Act
      const response = await request(librarianApp)
        .patch(`/api/librarians/borrowings/${borrowingId}/return`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('returned');
      expect(prisma.borrowing.update).toHaveBeenCalled();
      expect(prisma.bookCopy.update).toHaveBeenCalledWith({
        where: { id: mockBorrowing.bookCopyId },
        data: { status: 'AVAILABLE' },
      });
    });

    it('should return error when borrowing not found for return', async () => {
      // Arrange
      const borrowingId = 'non-existent-id';
      prisma.borrowing.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(librarianApp)
        .patch(`/api/librarians/borrowings/${borrowingId}/return`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(prisma.borrowing.update).not.toHaveBeenCalled();
    });
  });

  // ==================== GET ACTIVE BORROWINGS (LIBRARIAN) TESTS ====================

  describe('GET /api/librarians/borrowings/active', () => {
    it('should get all active borrowings for librarian', async () => {
      // Arrange
      const mockActiveBorrowings = [
        {
          id: 'borrowing-1',
          status: 'APPROVED',
          member: {
            id: 'member-1',
            email: 'member1@test.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          bookCopy: {
            id: 'copy-1',
            copyNumber: 1,
            book: {
              id: 'book-1',
              title: 'Test Book',
            },
          },
          dueDate: new Date(),
        },
      ];

      prisma.borrowing.findMany = vi.fn().mockResolvedValue(mockActiveBorrowings);

      // Act
      const response = await request(librarianApp)
        .get('/api/librarians/borrowings/active')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(prisma.borrowing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'APPROVED' },
        })
      );
    });
  });
});

