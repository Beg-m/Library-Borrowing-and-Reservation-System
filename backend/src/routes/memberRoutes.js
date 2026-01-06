import express from 'express';
import * as memberController from '../controllers/memberController.js';
import { authenticate, authorize, verifyUserActive } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication and member role
router.use(authenticate);
router.use(authorize('MEMBER'));
router.use(verifyUserActive);

// Book search and details
router.get('/books/search', memberController.searchBooksController);
router.get('/books/:bookId', memberController.getBookDetailsController);
router.get('/categories', memberController.getCategoriesController);

// Borrowings
router.post('/borrowings', memberController.borrowBookCopyController);
router.get('/borrowings/active', memberController.getActiveBorrowingsController);
router.get('/borrowings/history', memberController.getBorrowingHistoryController);

// Reservations
router.post('/reservations', memberController.reserveBookController);
router.get('/reservations/active', memberController.getActiveReservationsController);
router.delete('/reservations/:reservationId', memberController.cancelReservationController);

export default router;

