import * as memberService from '../services/memberService.js';

/**
 * Search books
 * GET /api/members/books/search
 */
export const searchBooksController = async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const books = await memberService.searchBooks(search, categoryId);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get book details
 * GET /api/members/books/:bookId
 */
export const getBookDetailsController = async (req, res) => {
  try {
    const { bookId } = req.params;
    const book = await memberService.getBookDetails(bookId);
    res.json(book);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Borrow a book copy
 * POST /api/members/borrowings
 */
export const borrowBookCopyController = async (req, res) => {
  try {
    const { bookCopyId } = req.body;
    const memberId = req.user.id;

    if (!bookCopyId) {
      return res.status(400).json({ error: 'bookCopyId is required' });
    }

    const borrowing = await memberService.borrowBookCopy(memberId, bookCopyId);
    res.status(201).json(borrowing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reserve a book
 * POST /api/members/reservations
 */
export const reserveBookController = async (req, res) => {
  try {
    const { bookId } = req.body;
    const memberId = req.user.id;

    if (!bookId) {
      return res.status(400).json({ error: 'bookId is required' });
    }

    const reservation = await memberService.reserveBook(memberId, bookId);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get active borrowings
 * GET /api/members/borrowings/active
 */
export const getActiveBorrowingsController = async (req, res) => {
  try {
    const memberId = req.user.id;
    const borrowings = await memberService.getActiveBorrowings(memberId);
    res.json(borrowings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get active reservations
 * GET /api/members/reservations/active
 */
export const getActiveReservationsController = async (req, res) => {
  try {
    const memberId = req.user.id;
    const reservations = await memberService.getActiveReservations(memberId);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get borrowing history
 * GET /api/members/borrowings/history
 */
export const getBorrowingHistoryController = async (req, res) => {
  try {
    const memberId = req.user.id;
    console.log('Getting borrowing history for memberId:', memberId);
    const borrowings = await memberService.getBorrowingHistory(memberId);
    console.log('Found borrowings:', borrowings.length);
    res.json(borrowings);
  } catch (error) {
    console.error('Error in getBorrowingHistoryController:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cancel reservation
 * DELETE /api/members/reservations/:reservationId
 */
export const cancelReservationController = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const memberId = req.user.id;

    const reservation = await memberService.cancelReservation(memberId, reservationId);
    res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get categories
 * GET /api/members/categories
 */
export const getCategoriesController = async (req, res) => {
  try {
    const categories = await memberService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

