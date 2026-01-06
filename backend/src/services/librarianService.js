import prisma from '../utils/prisma.js';

/**
 * Get pending borrowing requests
 */
export const getPendingBorrowings = async () => {
  const borrowings = await prisma.borrowing.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
      createdAt: 'asc',
    },
  });

  return borrowings;
};

/**
 * Get active (approved) borrowings
 */
export const getActiveBorrowings = async () => {
  const borrowings = await prisma.borrowing.findMany({
    where: {
      status: 'APPROVED',
    },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
      dueDate: 'asc',
    },
  });

  // Check for overdue
  const now = new Date();
  return borrowings.map((borrowing) => {
    const isOverdue = borrowing.dueDate && new Date(borrowing.dueDate) < now;
    return {
      ...borrowing,
      isOverdue,
    };
  });
};

/**
 * Get pending reservation requests
 */
export const getPendingReservations = async () => {
  const reservations = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      book: {
        include: {
          category: true,
          bookCopies: true,
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
 * Approve a borrowing request
 */
export const approveBorrowing = async (borrowingId) => {
  // Find borrowing
  const borrowing = await prisma.borrowing.findUnique({
    where: { id: borrowingId },
    include: { bookCopy: true },
  });

  if (!borrowing) {
    throw new Error('Borrowing request not found');
  }

  if (borrowing.status !== 'PENDING') {
    throw new Error('Borrowing request is not pending');
  }

  // Check if book copy is still available
  if (borrowing.bookCopy.status !== 'RESERVED') {
    throw new Error('Book copy is not in the expected status');
  }

  // Update borrowing status
  const updatedBorrowing = await prisma.borrowing.update({
    where: { id: borrowingId },
    data: {
      status: 'APPROVED',
      borrowDate: new Date(),
    },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
  });

  // Update book copy status to BORROWED
  await prisma.bookCopy.update({
    where: { id: borrowing.bookCopyId },
    data: { status: 'BORROWED' },
  });

  return updatedBorrowing;
};

/**
 * Reject a borrowing request
 */
export const rejectBorrowing = async (borrowingId) => {
  // Find borrowing
  const borrowing = await prisma.borrowing.findUnique({
    where: { id: borrowingId },
  });

  if (!borrowing) {
    throw new Error('Borrowing request not found');
  }

  if (borrowing.status !== 'PENDING') {
    throw new Error('Borrowing request is not pending');
  }

  // Update borrowing status
  const updatedBorrowing = await prisma.borrowing.update({
    where: { id: borrowingId },
    data: { status: 'REJECTED' },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
  });

  // Update book copy status back to AVAILABLE
  await prisma.bookCopy.update({
    where: { id: borrowing.bookCopyId },
    data: { status: 'AVAILABLE' },
  });

  return updatedBorrowing;
};

/**
 * Approve a reservation request
 */
export const approveReservation = async (reservationId) => {
  // Find reservation
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      book: {
        include: {
          bookCopies: true,
        },
      },
    },
  });

  if (!reservation) {
    throw new Error('Reservation request not found');
  }

  if (reservation.status !== 'PENDING') {
    throw new Error('Reservation request is not pending');
  }

  // Check if there's an available copy (shouldn't happen if reservation was made correctly, but check anyway)
  const availableCopy = reservation.book.bookCopies.find((copy) => copy.status === 'AVAILABLE');
  if (availableCopy) {
    // If available copy exists, update reservation to ACTIVE and mark copy as RESERVED
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'ACTIVE' },
    });

    await prisma.bookCopy.update({
      where: { id: availableCopy.id },
      data: { status: 'RESERVED' },
    });
  } else {
    // Just update status to ACTIVE (waiting for copy to become available)
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'ACTIVE' },
    });
  }

  const updatedReservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      book: {
        include: {
          category: true,
        },
      },
    },
  });

  return updatedReservation;
};

/**
 * Reject a reservation request
 */
export const rejectReservation = async (reservationId) => {
  // Find reservation
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });

  if (!reservation) {
    throw new Error('Reservation request not found');
  }

  if (reservation.status !== 'PENDING') {
    throw new Error('Reservation request is not pending');
  }

  // Update reservation status to CANCELLED
  const updatedReservation = await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'CANCELLED' },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
      book: {
        include: {
          category: true,
        },
      },
    },
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
 * Return a book (mark borrowing as returned)
 */
export const returnBook = async (borrowingId) => {
  // Find borrowing
  const borrowing = await prisma.borrowing.findUnique({
    where: { id: borrowingId },
    include: { bookCopy: true },
  });

  if (!borrowing) {
    throw new Error('Borrowing not found');
  }

  if (borrowing.status !== 'APPROVED') {
    throw new Error('Only approved borrowings can be returned');
  }

  // Update borrowing status
  const updatedBorrowing = await prisma.borrowing.update({
    where: { id: borrowingId },
    data: {
      status: 'RETURNED',
      returnDate: new Date(),
    },
    include: {
      member: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
  });

  // Check if there's a reservation waiting for this book
  const nextReservation = await prisma.reservation.findFirst({
    where: {
      bookId: borrowing.bookCopy.bookId,
      status: 'ACTIVE',
    },
    orderBy: {
      queuePosition: 'asc',
    },
  });

  if (nextReservation) {
    // Mark copy as RESERVED for the next person in queue
    await prisma.bookCopy.update({
      where: { id: borrowing.bookCopyId },
      data: { status: 'RESERVED' },
    });

    // Update queue positions
    await prisma.reservation.updateMany({
      where: {
        bookId: borrowing.bookCopy.bookId,
        status: 'ACTIVE',
        queuePosition: { gt: nextReservation.queuePosition },
      },
      data: {
        queuePosition: { decrement: 1 },
      },
    });
  } else {
    // Mark copy as AVAILABLE
    await prisma.bookCopy.update({
      where: { id: borrowing.bookCopyId },
      data: { status: 'AVAILABLE' },
    });
  }

  return updatedBorrowing;
};

/**
 * Check and update overdue borrowings (utility function)
 */
export const updateOverdueBorrowings = async () => {
  const now = new Date();
  const overdueBorrowings = await prisma.borrowing.updateMany({
    where: {
      status: 'APPROVED',
      dueDate: {
        lt: now,
      },
    },
    data: {
      status: 'OVERDUE',
    },
  });

  return overdueBorrowings;
};

