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
 * Reservation Management API Unit Tests
 * 
 * Tests for reservation-related endpoints including:
 * - Create reservation
 * - Prevent duplicate reservation
 * - Cancel reservation
 * - Get pending reservations
 * - Approve/reject reservations
 * 
 * All database operations are mocked using vi.mock()
 */
describe('Reservation Routes (/api/members/reservations and /api/librarians/reservations)', () => {
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

  // ==================== CREATE RESERVATION TESTS ====================

  describe('POST /api/members/reservations', () => {
    it('should create reservation successfully', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const memberId = 'member-id-123';
      
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        bookCopies: [
          { id: 'copy-1', status: 'BORROWED' },
          { id: 'copy-2', status: 'BORROWED' },
        ],
      };

      // Mock book exists
      prisma.book.findUnique = vi.fn().mockResolvedValue(mockBook);
      
      // Mock no existing reservation
      prisma.reservation.findFirst = vi.fn().mockResolvedValue(null);
      
      // Mock queue position calculation (using aggregate)
      prisma.reservation.aggregate = vi.fn().mockResolvedValue({
        _max: { queuePosition: null },
      });
      
      // Mock reservation creation
      const createdReservation = {
        id: 'reservation-id-123',
        memberId,
        bookId,
        status: 'PENDING',
        queuePosition: 1,
        book: mockBook,
      };
      prisma.reservation.create = vi.fn().mockResolvedValue(createdReservation);

      // Act
      const response = await request(memberApp)
        .post('/api/members/reservations')
        .send({ bookId })
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('queuePosition');
      expect(prisma.book.findUnique).toHaveBeenCalled();
      expect(prisma.reservation.findFirst).toHaveBeenCalled();
      expect(prisma.reservation.create).toHaveBeenCalled();
    });

    it('should return validation error for missing bookId', async () => {
      // Arrange
      const invalidRequest = {};
      // Missing bookId

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/reservations')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should return error when book not found', async () => {
      // Arrange
      const bookId = 'non-existent-book';
      
      prisma.book.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/reservations')
        .send({ bookId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should prevent duplicate reservation', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const memberId = 'member-id-123';
      
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        bookCopies: [],
      };

      prisma.book.findUnique = vi.fn().mockResolvedValue(mockBook);
      
      // Mock existing reservation
      prisma.reservation.findFirst = vi.fn().mockResolvedValue({
        id: 'existing-reservation-id',
        status: 'PENDING',
      });

      // Act & Assert
      const response = await request(memberApp)
        .post('/api/members/reservations')
        .send({ bookId })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already');
      expect(prisma.reservation.create).not.toHaveBeenCalled();
    });

    it('should calculate correct queue position', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const memberId = 'member-id-123';
      
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        bookCopies: [],
      };

      prisma.book.findUnique = vi.fn().mockResolvedValue(mockBook);
      prisma.reservation.findFirst = vi.fn().mockResolvedValue(null);
      
      // Mock 2 existing reservations, so new one should be position 3
      prisma.reservation.aggregate = vi.fn().mockResolvedValue({
        _max: { queuePosition: 2 },
      });
      
      const createdReservation = {
        id: 'reservation-id-123',
        memberId,
        bookId,
        status: 'PENDING',
        queuePosition: 3,
        book: mockBook,
      };
      prisma.reservation.create = vi.fn().mockResolvedValue(createdReservation);

      // Act
      const response = await request(memberApp)
        .post('/api/members/reservations')
        .send({ bookId })
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('queuePosition', 3);
      expect(prisma.reservation.aggregate).toHaveBeenCalled();
    });
  });

  // ==================== GET ACTIVE RESERVATIONS TESTS ====================

  describe('GET /api/members/reservations/active', () => {
    it('should get active reservations successfully', async () => {
      // Arrange
      const memberId = 'member-id-123';
      const mockReservations = [
        {
          id: 'reservation-1',
          memberId,
          status: 'ACTIVE',
          queuePosition: 1,
          book: {
            id: 'book-1',
            title: 'Book One',
            author: 'Author One',
          },
        },
        {
          id: 'reservation-2',
          memberId,
          status: 'PENDING',
          queuePosition: 2,
          book: {
            id: 'book-2',
            title: 'Book Two',
            author: 'Author Two',
          },
        },
      ];

      prisma.reservation.findMany = vi.fn().mockResolvedValue(mockReservations);

      // Act
      const response = await request(memberApp)
        .get('/api/members/reservations/active')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('book');
      expect(response.body[0]).toHaveProperty('queuePosition');
      expect(prisma.reservation.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no active reservations', async () => {
      // Arrange
      prisma.reservation.findMany = vi.fn().mockResolvedValue([]);

      // Act
      const response = await request(memberApp)
        .get('/api/members/reservations/active')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });

  // ==================== CANCEL RESERVATION TESTS ====================

  describe('DELETE /api/members/reservations/:reservationId', () => {
    it('should cancel reservation successfully', async () => {
      // Arrange
      const reservationId = 'reservation-id-123';
      const memberId = 'member-id-123';
      
      const mockReservation = {
        id: reservationId,
        memberId,
        status: 'PENDING',
        bookId: 'book-id-123',
        queuePosition: 1,
      };

      prisma.reservation.findUnique = vi.fn().mockResolvedValue(mockReservation);
      prisma.reservation.update = vi.fn().mockResolvedValue({
        ...mockReservation,
        status: 'CANCELLED',
      });
      
      // Mock queue position updates
      prisma.reservation.updateMany = vi.fn().mockResolvedValue({ count: 0 });

      // Act
      const response = await request(memberApp)
        .delete(`/api/members/reservations/${reservationId}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('cancelled');
      expect(prisma.reservation.findUnique).toHaveBeenCalled();
      expect(prisma.reservation.update).toHaveBeenCalled();
    });

    it('should return error when reservation not found', async () => {
      // Arrange
      const reservationId = 'non-existent-id';
      prisma.reservation.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(memberApp)
        .delete(`/api/members/reservations/${reservationId}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
      expect(prisma.reservation.delete).not.toHaveBeenCalled();
    });

    it('should return error when trying to cancel other member\'s reservation', async () => {
      // Arrange
      const reservationId = 'reservation-id-123';
      const otherMemberId = 'other-member-id';
      
      const mockReservation = {
        id: reservationId,
        memberId: otherMemberId, // Different member (not member-id-123)
        status: 'PENDING',
      };

      prisma.reservation.findUnique = vi.fn().mockResolvedValue(mockReservation);

      // Act & Assert
      // Controller returns 400 for unauthorized errors, not 403
      const response = await request(memberApp)
        .delete(`/api/members/reservations/${reservationId}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Unauthorized');
      expect(prisma.reservation.delete).not.toHaveBeenCalled();
    });
  });

  // ==================== GET PENDING RESERVATIONS (LIBRARIAN) TESTS ====================

  describe('GET /api/librarians/reservations/pending', () => {
    it('should get pending reservations successfully', async () => {
      // Arrange
      const mockPendingReservations = [
        {
          id: 'reservation-1',
          status: 'PENDING',
          queuePosition: 1,
          member: {
            id: 'member-1',
            email: 'member1@test.com',
            firstName: 'John',
            lastName: 'Doe',
          },
          book: {
            id: 'book-1',
            title: 'Test Book',
            author: 'Test Author',
          },
        },
      ];

      prisma.reservation.findMany = vi.fn().mockResolvedValue(mockPendingReservations);

      // Act
      const response = await request(librarianApp)
        .get('/api/librarians/reservations/pending')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0]).toHaveProperty('status', 'PENDING');
      expect(response.body[0]).toHaveProperty('member');
      expect(response.body[0]).toHaveProperty('book');
      expect(prisma.reservation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PENDING' },
        })
      );
    });

    it('should return empty array when no pending reservations', async () => {
      // Arrange
      prisma.reservation.findMany = vi.fn().mockResolvedValue([]);

      // Act
      const response = await request(librarianApp)
        .get('/api/librarians/reservations/pending')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });

  // ==================== APPROVE RESERVATION TESTS ====================

  describe('PATCH /api/librarians/reservations/:reservationId/approve', () => {
    it('should approve reservation successfully', async () => {
      // Arrange
      const reservationId = 'reservation-id-123';
      const mockReservation = {
        id: reservationId,
        status: 'PENDING',
        bookId: 'book-id-123',
        memberId: 'member-id-123',
        queuePosition: 1,
        book: {
          id: 'book-id-123',
          bookCopies: [], // No available copies
        },
      };

      prisma.reservation.findUnique = vi.fn().mockResolvedValue({
        ...mockReservation,
        include: {
          book: {
            include: {
              bookCopies: true,
            },
          },
        },
      });
      prisma.reservation.update = vi.fn().mockResolvedValue({
        ...mockReservation,
        status: 'ACTIVE',
      });

      // Act
      const response = await request(librarianApp)
        .patch(`/api/librarians/reservations/${reservationId}/approve`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('approved');
      expect(response.body).toHaveProperty('reservation');
      expect(prisma.reservation.update).toHaveBeenCalled();
    });

    it('should return error when reservation not found', async () => {
      // Arrange
      const reservationId = 'non-existent-id';
      prisma.reservation.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(librarianApp)
        .patch(`/api/librarians/reservations/${reservationId}/approve`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(prisma.reservation.update).not.toHaveBeenCalled();
    });
  });

  // ==================== REJECT RESERVATION TESTS ====================

  describe('PATCH /api/librarians/reservations/:reservationId/reject', () => {
    it('should reject reservation successfully', async () => {
      // Arrange
      const reservationId = 'reservation-id-123';
      const mockReservation = {
        id: reservationId,
        status: 'PENDING',
        bookId: 'book-id-123',
        queuePosition: 1,
      };

      prisma.reservation.findUnique = vi.fn().mockResolvedValue(mockReservation);
      prisma.reservation.update = vi.fn().mockResolvedValue({
        ...mockReservation,
        status: 'CANCELLED', // rejectReservation sets status to CANCELLED, not REJECTED
        member: { id: 'member-1', email: 'test@test.com', firstName: 'John', lastName: 'Doe' },
        book: { id: 'book-1', title: 'Test Book', category: { id: 'cat-1', name: 'Fiction' } },
      });
      prisma.reservation.updateMany = vi.fn().mockResolvedValue({ count: 0 });

      // Act
      const response = await request(librarianApp)
        .patch(`/api/librarians/reservations/${reservationId}/reject`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('rejected');
      expect(prisma.reservation.update).toHaveBeenCalled();
    });
  });
});

