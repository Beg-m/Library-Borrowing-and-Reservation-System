import prisma from '../utils/prisma.js';

/**
 * Search books by title, author, or category
 */
export const searchBooks = async (searchTerm, categoryId) => {
  const where = {};

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { author: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const books = await prisma.book.findMany({
    where,
    include: {
      category: true,
      bookCopies: {
        select: {
          id: true,
          copyNumber: true,
          status: true,
        },
      },
      _count: {
        select: {
          bookCopies: true,
        },
      },
    },
  });

  // Add availability info
  return books.map((book) => {
    const availableCopies = book.bookCopies.filter((copy) => copy.status === 'AVAILABLE').length;
    return {
      ...book,
      availableCopies,
      totalCopies: book._count.bookCopies,
    };
  });
};

/**
 * Get book details by ID
 */
export const getBookDetails = async (bookId) => {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      category: true,
      bookCopies: {
        select: {
          id: true,
          copyNumber: true,
          status: true,
        },
      },
    },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  const availableCopies = book.bookCopies.filter((copy) => copy.status === 'AVAILABLE').length;
  const reservedCopies = book.bookCopies.filter((copy) => copy.status === 'RESERVED').length;
  const borrowedCopies = book.bookCopies.filter((copy) => copy.status === 'BORROWED').length;

  return {
    ...book,
    availableCopies,
    reservedCopies,
    borrowedCopies,
    totalCopies: book.bookCopies.length,
  };
};

/**
 * Borrow a book copy
 */
export const borrowBookCopy = async (memberId, bookCopyId) => {
  // Check if book copy exists and is available
  const bookCopy = await prisma.bookCopy.findUnique({
    where: { id: bookCopyId },
    include: { book: true },
  });

  if (!bookCopy) {
    throw new Error('Book copy not found');
  }

  if (bookCopy.status !== 'AVAILABLE') {
    throw new Error('Book copy is not available for borrowing');
  }

  // Check if member already has this book borrowed
  const existingBorrowing = await prisma.borrowing.findFirst({
    where: {
      memberId,
      bookCopyId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });

  if (existingBorrowing) {
    throw new Error('You already have a pending or active borrowing for this book copy');
  }

  // Calculate due date (14 days from now)
  const borrowDate = new Date();
  const dueDate = new Date(borrowDate);
  dueDate.setDate(dueDate.getDate() + 14);

  // Create borrowing request
  const borrowing = await prisma.borrowing.create({
    data: {
      memberId,
      bookCopyId,
      status: 'PENDING',
      borrowDate,
      dueDate,
    },
    include: {
      bookCopy: {
        include: {
          book: true,
        },
      },
    },
  });

  // Update book copy status to RESERVED (will be BORROWED after approval)
  await prisma.bookCopy.update({
    where: { id: bookCopyId },
    data: { status: 'RESERVED' },
  });

  return borrowing;
};

/**
 * Reserve a book (when no copies are available)
 */
export const reserveBook = async (memberId, bookId) => {
  // Check if book exists
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      bookCopies: true,
    },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  // Allow reservation even if book is available (user preference)
  // Check if member already has an active reservation for this book
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      memberId,
      bookId,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
  });

  if (existingReservation) {
    throw new Error('You already have an active reservation for this book');
  }

  // Get the highest queue position for this book
  const maxQueuePosition = await prisma.reservation.aggregate({
    where: {
      bookId,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    _max: {
      queuePosition: true,
    },
  });

  const queuePosition = (maxQueuePosition._max.queuePosition || 0) + 1;

  // Create reservation
  const reservation = await prisma.reservation.create({
    data: {
      memberId,
      bookId,
      status: 'PENDING',
      queuePosition,
    },
    include: {
      book: {
        include: {
          category: true,
        },
      },
    },
  });

  return reservation;
};

/**
 * Get member's active borrowings
 */
export const getActiveBorrowings = async (memberId) => {
  const borrowings = await prisma.borrowing.findMany({
    where: {
      memberId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
    include: {
      bookCopy: {
        include: {
          book: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Check for overdue
  const now = new Date();
  return borrowings.map((borrowing) => {
    const isOverdue = borrowing.dueDate && new Date(borrowing.dueDate) < now && borrowing.status === 'APPROVED';
    return {
      ...borrowing,
      isOverdue,
    };
  });
};

/**
 * Get member's active reservations
 */
export const getActiveReservations = async (memberId) => {
  const reservations = await prisma.reservation.findMany({
    where: {
      memberId,
      status: { in: ['PENDING', 'ACTIVE'] },
    },
    include: {
      book: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      queuePosition: 'asc',
    },
  });

  return reservations;
};

/**
 * Get member's borrowing history
 */
export const getBorrowingHistory = async (memberId) => {
  const borrowings = await prisma.borrowing.findMany({
    where: {
      memberId,
      status: { in: ['RETURNED', 'OVERDUE'] },
    },
    include: {
      bookCopy: {
        include: {
          book: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return borrowings;
};

/**
 * Cancel a reservation
 */
export const cancelReservation = async (memberId, reservationId) => {
  // Find reservation
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  if (reservation.memberId !== memberId) {
    throw new Error('Unauthorized: This reservation does not belong to you');
  }

  if (reservation.status === 'COMPLETED' || reservation.status === 'CANCELLED') {
    throw new Error('Cannot cancel a completed or already cancelled reservation');
  }

  // Update reservation status
  const updatedReservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'CANCELLED' },
  });

  // Update queue positions for remaining reservations
  await prisma.reservation.updateMany({
    where: {
      bookId: reservation.bookId,
      status: { in: ['PENDING', 'ACTIVE'] },
      queuePosition: { gt: reservation.queuePosition },
    },
    data: {
      queuePosition: { decrement: 1 },
    },
  });

  return updatedReservation;
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  return await prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

