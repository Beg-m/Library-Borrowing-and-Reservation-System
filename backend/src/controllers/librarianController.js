import * as librarianService from '../services/librarianService.js';

/**
 * Get pending borrowing requests
 * GET /api/librarians/borrowings/pending
 */
export const getPendingBorrowingsController = async (req, res) => {
  try {
    const borrowings = await librarianService.getPendingBorrowings();
    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get active borrowings
 * GET /api/librarians/borrowings/active
 */
export const getActiveBorrowingsController = async (req, res) => {
  try {
    const borrowings = await librarianService.getActiveBorrowings();
    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get pending reservation requests
 * GET /api/librarians/reservations/pending
 */
export const getPendingReservationsController = async (req, res) => {
  try {
    const reservations = await librarianService.getPendingReservations();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve borrowing request
 * PATCH /api/librarians/borrowings/:borrowingId/approve
 */
export const approveBorrowingController = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const borrowing = await librarianService.approveBorrowing(borrowingId);
    res.json({ message: 'Borrowing approved successfully', borrowing });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reject borrowing request
 * PATCH /api/librarians/borrowings/:borrowingId/reject
 */
export const rejectBorrowingController = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const borrowing = await librarianService.rejectBorrowing(borrowingId);
    res.json({ message: 'Borrowing rejected successfully', borrowing });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Approve reservation request
 * PATCH /api/librarians/reservations/:reservationId/approve
 */
export const approveReservationController = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await librarianService.approveReservation(reservationId);
    res.json({ message: 'Reservation approved successfully', reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reject reservation request
 * PATCH /api/librarians/reservations/:reservationId/reject
 */
export const rejectReservationController = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const reservation = await librarianService.rejectReservation(reservationId);
    res.json({ message: 'Reservation rejected successfully', reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Return a book
 * PATCH /api/librarians/borrowings/:borrowingId/return
 */
export const returnBookController = async (req, res) => {
  try {
    const { borrowingId } = req.params;
    const borrowing = await librarianService.returnBook(borrowingId);
    res.json({ message: 'Book returned successfully', borrowing });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update overdue borrowings
 * POST /api/librarians/borrowings/update-overdue
 */
export const updateOverdueBorrowingsController = async (req, res) => {
  try {
    const result = await librarianService.updateOverdueBorrowings();
    res.json({ message: 'Overdue borrowings updated', count: result.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

