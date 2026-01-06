import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import prisma from '../src/utils/prisma.js';
import { resetPrismaMocks } from './helpers.js';

// Import routes
import adminRoutes from '../src/routes/adminRoutes.js';
import memberRoutes from '../src/routes/memberRoutes.js';

dotenv.config();

/**
 * Mock authentication middleware for admin routes
 */
const mockAdminAuth = () => {
  return (req, res, next) => {
    req.user = {
      id: 'admin-id-123',
      email: 'admin@test.com',
      role: 'ADMIN',
    };
    next();
  };
};

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
 * Book Management API Unit Tests
 * 
 * Tests for book-related endpoints including:
 * - Book creation
 * - Book retrieval
 * - Book search/filter
 * - Book deletion
 * - Duplicate ISBN handling
 * 
 * All database operations are mocked using vi.mock()
 */
describe('Book Routes (/api/admin/books and /api/members/books)', () => {
  let adminApp;
  let memberApp;
  
  beforeEach(() => {
    // Reset all Prisma mocks before each test
    resetPrismaMocks(prisma);
    
    // Mock verifyUserActive for admin
    prisma.adminUser.findUnique = vi.fn().mockResolvedValue({
      id: 'admin-id-123',
      email: 'admin@test.com',
      isActive: true,
    });
    
    // Mock verifyUserActive for member
    prisma.member.findUnique = vi.fn().mockResolvedValue({
      id: 'member-id-123',
      email: 'member@test.com',
      isActive: true,
    });
    
    // Create admin app
    adminApp = express();
    adminApp.use(express.json());
    // Set req.user before routes (mock middleware will use it)
    adminApp.use('/api/admin', (req, res, next) => {
      req.user = {
        id: 'admin-id-123',
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      next();
    });
    adminApp.use('/api/admin', adminRoutes);
    
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
  });

  // ==================== BOOK CREATION TESTS ====================

  describe('POST /api/admin/books', () => {
    it('should create a new book successfully', async () => {
      // Arrange
      const newBook = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0123456789',
        description: 'A test book description',
        categoryId: 'category-id-123',
      };

      // Mock category exists
      prisma.category.findUnique = vi.fn().mockResolvedValue({
        id: 'category-id-123',
        name: 'Fiction',
      });

      // Mock book creation
      const createdBook = {
        id: 'book-id-123',
        ...newBook,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'category-id-123',
          name: 'Fiction',
        },
        bookCopies: [],
      };
      prisma.book.create = vi.fn().mockResolvedValue(createdBook);

      // Act
      const response = await request(adminApp)
        .post('/api/admin/books')
        .send(newBook)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('message', 'Book created successfully');
      expect(response.body).toHaveProperty('book');
      expect(response.body.book.title).toBe(newBook.title);
      expect(response.body.book.isbn).toBe(newBook.isbn);
      expect(prisma.book.create).toHaveBeenCalled();
    });

    it('should return validation error for missing required fields', async () => {
      // Arrange
      const invalidBook = {
        title: 'Test Book',
        // Missing author, isbn, categoryId
      };

      // Act & Assert
      const response = await request(adminApp)
        .post('/api/admin/books')
        .send(invalidBook)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(prisma.book.create).not.toHaveBeenCalled();
    });

    it('should return error for duplicate ISBN', async () => {
      // Arrange
      const newBook = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0123456789',
        categoryId: 'category-id-123',
      };

      // Mock book with same ISBN already exists
      prisma.book.findUnique = vi.fn().mockResolvedValue({
        id: 'existing-book-id',
        isbn: '978-0123456789',
        title: 'Existing Book',
      });

      // Act & Assert
      const response = await request(adminApp)
        .post('/api/admin/books')
        .send(newBook)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('ISBN');
      expect(prisma.book.create).not.toHaveBeenCalled();
    });
  });

  // ==================== BOOK RETRIEVAL TESTS ====================

  describe('GET /api/admin/books', () => {
    it('should get all books successfully', async () => {
      // Arrange
      const mockBooks = [
        {
          id: 'book-1',
          title: 'Book One',
          author: 'Author One',
          isbn: '978-1111111111',
          category: { id: 'cat-1', name: 'Fiction' },
          bookCopies: [],
        },
        {
          id: 'book-2',
          title: 'Book Two',
          author: 'Author Two',
          isbn: '978-2222222222',
          category: { id: 'cat-2', name: 'Non-Fiction' },
          bookCopies: [],
        },
      ];

      prisma.book.findMany = vi.fn().mockResolvedValue(mockBooks);

      // Act
      const response = await request(adminApp)
        .get('/api/admin/books')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('isbn');
      expect(prisma.book.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no books exist', async () => {
      // Arrange
      prisma.book.findMany = vi.fn().mockResolvedValue([]);

      // Act
      const response = await request(adminApp)
        .get('/api/admin/books')
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/admin/books/:bookId', () => {
    it('should get book by ID successfully', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0123456789',
        category: { id: 'cat-1', name: 'Fiction' },
        bookCopies: [
          { id: 'copy-1', copyNumber: 1, status: 'AVAILABLE' },
          { id: 'copy-2', copyNumber: 2, status: 'BORROWED' },
        ],
      };

      prisma.book.findUnique = vi.fn().mockResolvedValue(mockBook);

      // Act
      const response = await request(adminApp)
        .get(`/api/admin/books/${bookId}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('id', bookId);
      expect(response.body).toHaveProperty('title', 'Test Book');
      expect(prisma.book.findUnique).toHaveBeenCalled();
    });

    it('should return 404 when book not found', async () => {
      // Arrange
      const bookId = 'non-existent-id';
      prisma.book.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(adminApp)
        .get(`/api/admin/books/${bookId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  // ==================== BOOK SEARCH TESTS ====================

  describe('GET /api/members/books/search', () => {
    it('should search books by title successfully', async () => {
      // Arrange
      const searchTerm = 'JavaScript';
      const mockBooks = [
        {
          id: 'book-1',
          title: 'JavaScript Guide',
          author: 'John Doe',
          isbn: '978-1111111111',
          category: { id: 'cat-1', name: 'Programming' },
          bookCopies: [
            { id: 'copy-1', copyNumber: 1, status: 'AVAILABLE' },
          ],
          _count: { bookCopies: 1 },
        },
      ];

      prisma.book.findMany = vi.fn().mockResolvedValue(mockBooks);

      // Act
      const response = await request(memberApp)
        .get('/api/members/books/search')
        .query({ search: searchTerm })
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('availableCopies');
      expect(response.body[0]).toHaveProperty('totalCopies');
      expect(prisma.book.findMany).toHaveBeenCalled();
    });

    it('should search books by author successfully', async () => {
      // Arrange
      const searchTerm = 'John Doe';
      const mockBooks = [
        {
          id: 'book-1',
          title: 'Test Book',
          author: 'John Doe',
          isbn: '978-1111111111',
          category: { id: 'cat-1', name: 'Fiction' },
          bookCopies: [],
          _count: { bookCopies: 0 },
        },
      ];

      prisma.book.findMany = vi.fn().mockResolvedValue(mockBooks);

      // Act
      const response = await request(memberApp)
        .get('/api/members/books/search')
        .query({ search: searchTerm })
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(prisma.book.findMany).toHaveBeenCalled();
    });

    it('should filter books by category successfully', async () => {
      // Arrange
      const categoryId = 'category-id-123';
      const mockBooks = [
        {
          id: 'book-1',
          title: 'Fiction Book',
          author: 'Author',
          isbn: '978-1111111111',
          category: { id: categoryId, name: 'Fiction' },
          bookCopies: [],
          _count: { bookCopies: 0 },
        },
      ];

      prisma.book.findMany = vi.fn().mockResolvedValue(mockBooks);

      // Act
      const response = await request(memberApp)
        .get('/api/members/books/search')
        .query({ categoryId })
        .expect(200);

      // Assert
      expect(response.body).toBeInstanceOf(Array);
      expect(prisma.book.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: categoryId,
          }),
        })
      );
    });
  });

  describe('GET /api/members/books/:bookId', () => {
    it('should get book details successfully', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        isbn: '978-0123456789',
        description: 'Book description',
        category: { id: 'cat-1', name: 'Fiction' },
        bookCopies: [
          { id: 'copy-1', copyNumber: 1, status: 'AVAILABLE' },
          { id: 'copy-2', copyNumber: 2, status: 'BORROWED' },
        ],
      };

      prisma.book.findUnique = vi.fn().mockResolvedValue(mockBook);

      // Act
      const response = await request(memberApp)
        .get(`/api/members/books/${bookId}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('id', bookId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('bookCopies');
      expect(response.body).toHaveProperty('availableCopies');
      expect(prisma.book.findUnique).toHaveBeenCalled();
    });

    it('should return 404 when book not found', async () => {
      // Arrange
      const bookId = 'non-existent-id';
      prisma.book.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      const response = await request(memberApp)
        .get(`/api/members/books/${bookId}`)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('not found');
    });
  });

  // ==================== BOOK DELETION TESTS ====================

  describe('DELETE /api/admin/books/:bookId', () => {
    it('should delete book successfully', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        bookCopies: [],
      };

      // Mock getBookById (used by deleteBook service) - need to check if it's called
      // deleteBook doesn't call getBookById, it directly checks borrowings/reservations
      // Mock active borrowings check (deleteBook checks for active borrowings)
      prisma.borrowing.findFirst = vi.fn()
        .mockResolvedValueOnce(null); // First call for borrowings
      // Mock active reservations check
      prisma.reservation.findFirst = vi.fn().mockResolvedValue(null);
      // Mock deleteMany for book copies
      prisma.bookCopy.deleteMany = vi.fn().mockResolvedValue({ count: 0 });
      prisma.book.delete = vi.fn().mockResolvedValue(mockBook);

      // Act
      const response = await request(adminApp)
        .delete(`/api/admin/books/${bookId}`)
        .expect(200);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('deleted');
      expect(prisma.book.delete).toHaveBeenCalledWith({
        where: { id: bookId },
      });
    });

    it('should return 400 when book not found for deletion', async () => {
      // Arrange
      const bookId = 'non-existent-id';
      // deleteBook service doesn't check if book exists, it only checks borrowings/reservations
      // So we need to make deleteBook fail by having it throw an error
      // Or test that delete succeeds (since deleteBook doesn't validate book existence)
      prisma.borrowing.findFirst = vi.fn().mockResolvedValue(null);
      prisma.reservation.findFirst = vi.fn().mockResolvedValue(null);
      prisma.bookCopy.deleteMany = vi.fn().mockResolvedValue({ count: 0 });
      // deleteBook will try to delete non-existent book - Prisma will throw
      prisma.book.delete = vi.fn().mockRejectedValue(new Error('Book not found'));

      // Act & Assert
      const response = await request(adminApp)
        .delete(`/api/admin/books/${bookId}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ==================== BOOK COPY MANAGEMENT TESTS ====================

  describe('POST /api/admin/books/:bookId/copies', () => {
    it('should add book copy successfully', async () => {
      // Arrange
      const bookId = 'book-id-123';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        bookCopies: [
          { id: 'copy-1', copyNumber: 1, status: 'AVAILABLE' },
        ],
      };

      // Mock getBookById
      prisma.book.findUnique = vi.fn().mockResolvedValue(mockBook);
      
      // Mock aggregate for max copy number
      prisma.bookCopy.aggregate = vi.fn().mockResolvedValue({
        _max: { copyNumber: 1 },
      });
      
      const newCopy = {
        id: 'copy-2',
        bookId: bookId,
        copyNumber: 2,
        status: 'AVAILABLE',
      };
      prisma.bookCopy.create = vi.fn().mockResolvedValue(newCopy);

      // Act
      const response = await request(adminApp)
        .post(`/api/admin/books/${bookId}/copies`)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('copy');
      expect(prisma.bookCopy.create).toHaveBeenCalled();
    });

    it('should return 400 when book not found for adding copy', async () => {
      // Arrange
      const bookId = 'non-existent-id';
      prisma.book.findUnique = vi.fn().mockResolvedValue(null);

      // Act & Assert
      // Controller returns 400 for all errors, not 404
      const response = await request(adminApp)
        .post(`/api/admin/books/${bookId}/copies`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(prisma.bookCopy.create).not.toHaveBeenCalled();
    });
  });
});

